import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import Sidebar from '../../../../src/components/Layout/Sidebar';
import useAuth from '../../../../src/hooks/useAuth';
import client from '../../../../src/api/client';

vi.mock('../../../../src/hooks/useAuth');
expect.extend(toHaveNoViolations);

const mockMenu = [
  {
    unique_id: 'msm_admin',
    screen_main_name: 'Admin',
    sub_screens: [
      { unique_id: 'us_user', screen_name: 'User', folder_name: 'user' }
    ]
  }
];

const renderSidebar = () => {
  useAuth.mockReturnValue({
    user: {
      userType: '5f97fc3257f2525529',
      mainScreens: ['msm_admin'],
      screens: ['us_user']
    }
  });
  vi.spyOn(client, 'get').mockResolvedValue({
    data: { status: 1, menu: mockMenu }
  });
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('A11y: Sidebar Component', () => {
  test('has no WCAG violations', async () => {
    const { container } = renderSidebar();
    await screen.findByText('Admin');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('navigation uses proper list structure', async () => {
    renderSidebar();
    await screen.findByText('Admin');
    const navLists = document.querySelectorAll('ul.navbar-nav');
    expect(navLists.length).toBeGreaterThan(0);
  });

  test('menu items have non-empty text', async () => {
    renderSidebar();
    await screen.findByText('Admin');
    const menuLinks = document.querySelectorAll('a.nav-link');
    menuLinks.forEach(link => {
      // Links should either have text or an accessible label
      const hasContent = link.textContent.trim() !== '' || link.getAttribute('aria-label');
      expect(hasContent).toBeTruthy();
    });
  });
});
