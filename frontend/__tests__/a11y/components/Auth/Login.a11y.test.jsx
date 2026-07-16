import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeAll } from 'vitest';
import Login from '../../../../src/pages/Login';
import { AuthProvider } from '../../../../src/context/AuthContext';
import djangoClient from '../../../../src/api/djangoClient';
import { vi } from 'vitest';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  vi.spyOn(djangoClient, 'get').mockResolvedValue({ data: { status: 0 } });
});

const renderLogin = () => render(
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('A11y: Login Component', () => {
  test('has no WCAG violations', async () => {
    const { container } = renderLogin();
    // Wait for AuthProvider loading state to resolve
    await screen.findByRole('button', { name: /sign in/i });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('password field has accessible label', async () => {
    renderLogin();
    const pwd = await screen.findAllByLabelText(/password/i);
    expect(pwd[0]).toBeInTheDocument();
  });

  test('username field has accessible label', async () => {
    renderLogin();
    const usr = await screen.findAllByLabelText(/username/i);
    expect(usr[0]).toBeInTheDocument();
  });

  test('submit button has accessible name', async () => {
    renderLogin();
    // Wait for loading state to resolve
    const btn = await screen.findByRole('button', { name: /sign in/i });
    expect(btn).toBeInTheDocument();
  });
});
