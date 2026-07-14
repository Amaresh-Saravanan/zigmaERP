import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import djangoClient from '../api/djangoClient';

vi.mock('../api/djangoClient', () => ({
  default: { post: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve()) },
}));

function renderSignup() {
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors and does not submit when fields are invalid', async () => {
    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'ab');
    await userEvent.type(screen.getByLabelText(/^email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password/i), 'weak');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(djangoClient.post).not.toHaveBeenCalled();
  });

  it('submits valid data and navigates to /login on success', async () => {
    djangoClient.post.mockResolvedValueOnce({
      data: { status: 1, msg: 'signup_pending', data: { user_name: 'gooduser' }, error: '' },
    });

    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'gooduser');
    await userEvent.type(screen.getByLabelText(/^email/i), 'good@example.com');
    await userEvent.type(screen.getByLabelText(/first name/i), 'Good');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(djangoClient.post).toHaveBeenCalledWith(
        '/auth/signup',
        expect.objectContaining({ user_name: 'gooduser', user_email: 'good@example.com' }),
        { suppressError: true }
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('shows a server error message when the username is already taken', async () => {
    djangoClient.post.mockRejectedValueOnce({
      response: { data: { status: 0, msg: 'error', data: null, error: 'This username is already taken.' } },
    });

    const Swal = (await import('sweetalert2')).default;
    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'dupeuser');
    await userEvent.type(screen.getByLabelText(/^email/i), 'dupe@example.com');
    await userEvent.type(screen.getByLabelText(/first name/i), 'Dupe');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Signup failed', text: 'This username is already taken.' })
      );
    });
  });
});
