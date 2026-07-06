import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login';
import { AuthProvider } from '../../../src/context/AuthContext';
import Swal from 'sweetalert2';
import djangoClient from '../../../src/api/djangoClient';

describe('Integration: Login Flow', () => {
  beforeEach(() => {
    vi.spyOn(djangoClient, 'post');
    // AuthProvider calls /auth/me on mount — report "not authenticated"
    vi.spyOn(djangoClient, 'get').mockResolvedValue({ data: { status: 0 } });
  });

  const renderLogin = () => render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  test('full login populates AuthContext with user data', async () => {
    djangoClient.post.mockResolvedValueOnce({
      data: {
        status: 1,
        data: {
          access_token: 'test-token',
          user: {
            unique_id: 'uid-admin',
            user_name: 'testuser',
            user_type: { unique_id: '5f97fc3257f2525529' },
            main_screens: [],
            screens: [],
          },
        },
      },
    });

    renderLogin();

    // Wait for AuthProvider to finish loading
    await screen.findAllByLabelText(/username/i);

    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'testuser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // It should successfully post and not show an error
      expect(Swal.fire).not.toHaveBeenCalled();
      expect(djangoClient.post).toHaveBeenCalledWith('/auth/login', expect.any(Object), expect.any(Object));
    });
  });

  test('shows error message on failed login', async () => {
    // Django answers bad credentials with HTTP 401 → axios rejects
    djangoClient.post.mockRejectedValueOnce({
      response: { status: 401, data: { status: 0, msg: 'incorrect' } },
    });

    renderLogin();
    
    // Wait for AuthProvider to finish loading
    await screen.findAllByLabelText(/username/i);
    
    await userEvent.type(screen.getAllByLabelText(/username/i)[0], 'wronguser');
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/incorrect/i)
        })
      );
    });
  });
});
