import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../../src/pages/Login';
import useAuth from '../../../../src/hooks/useAuth';
import client from '../../../../src/api/client';

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
    // Spy on the real client instead of mocking the module
    vi.spyOn(client, 'post');
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
    expect(client.post).not.toHaveBeenCalled();
  });

  test('calls login with credentials on submit', async () => {
    client.post.mockResolvedValueOnce({
      data: { status: 1, user: { user_name: 'testuser', password: 'password123' } }
    });
    
    renderLogin();
    
    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'testuser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(client.post).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({ user_name: 'testuser', password: 'password123' });
    });
  });

  test('disables submit button while logging in', async () => {
    client.post.mockImplementation(() => new Promise(() => {}));
    
    renderLogin();
    
    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'testuser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'password123');
    
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitBtn);
    
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/signing in/i);
  });
});
