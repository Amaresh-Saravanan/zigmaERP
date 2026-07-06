import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../../src/pages/Login';
import useAuth from '../../../../src/hooks/useAuth';
import djangoClient from '../../../../src/api/djangoClient';

vi.mock('../../../../src/hooks/useAuth');

describe('Unit: Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin
    });
    // Spy on the real Django client instead of mocking the module
    vi.spyOn(djangoClient, 'post');
  });

  const renderLogin = () => render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  test('renders username, password fields and submit button', () => {
    renderLogin();
    expect(screen.getAllByLabelText(/username/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('does not submit when fields are empty', async () => {
    renderLogin();
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.click(submitBtn);

    expect(mockLogin).not.toHaveBeenCalled();
    expect(djangoClient.post).not.toHaveBeenCalled();
  });

  test('calls login with credentials on submit', async () => {
    djangoClient.post.mockResolvedValueOnce({
      data: {
        status: 1,
        data: {
          access_token: 'test-token',
          user: {
            unique_id: 'uid-1',
            user_name: 'testuser',
            user_type: { unique_id: 'type-1' },
            main_screens: [],
            screens: [],
          },
        },
      },
    });

    renderLogin();

    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'testuser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(djangoClient.post).toHaveBeenCalledWith('/auth/login', expect.any(Object), expect.any(Object));
      // login() receives the camelCase-mapped user
      expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ userName: 'testuser' }));
    });
  });

  test('disables submit button while logging in', async () => {
    djangoClient.post.mockImplementation(() => new Promise(() => {}));
    
    renderLogin();
    
    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'testuser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'password123');
    
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitBtn);
    
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/signing in/i);
  });
});
