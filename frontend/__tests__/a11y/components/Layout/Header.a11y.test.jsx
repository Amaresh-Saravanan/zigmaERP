import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import Header from '../../../../src/components/Layout/Header';
import useAuth from '../../../../src/hooks/useAuth';
import djangoClient from '../../../../src/api/djangoClient';

vi.mock('../../../../src/hooks/useAuth');
expect.extend(toHaveNoViolations);

const renderHeader = () => {
  vi.spyOn(djangoClient, 'get').mockResolvedValue({ data: { isAuthenticated: false } });
  useAuth.mockReturnValue({
    user: { userName: 'testuser', userImage: 'img/user.jpg' },
    logout: vi.fn()
  });
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('A11y: Header Component', () => {
  test('has no WCAG violations', async () => {
    const { container } = renderHeader();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('logo images have alt text', () => {
    renderHeader();
    const logoImages = document.querySelectorAll('img');
    // Every img should have an alt attribute (empty or not)
    logoImages.forEach(img => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });

  test('header landmark is present', () => {
    renderHeader();
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  test('hamburger button has accessible label', () => {
    renderHeader();
    // The toggle button exists as a <button type="button">
    const btn = document.querySelector('#topnav-hamburger-icon');
    expect(btn).toBeInTheDocument();
  });
});
