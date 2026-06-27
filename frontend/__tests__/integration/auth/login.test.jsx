import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login';
import { AuthProvider } from '../../../src/context/AuthContext';
import Swal from 'sweetalert2';
import client from '../../../src/api/client';

describe('Integration: Login Flow', () => {
  beforeEach(() => {
    vi.spyOn(client, 'post');
    vi.spyOn(client, 'get').mockResolvedValue({ data: { isAuthenticated: false } });
  });

  const renderLogin = () => render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  test('full login populates AuthContext with user data', async () => {
    client.post.mockResolvedValueOnce({
      data: { status: 1, user: { user_name: 'testuser' } }
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
      expect(client.post).toHaveBeenCalledWith('folders/login/crud.php', expect.any(URLSearchParams), expect.any(Object));
    });
  });

  test('shows error message on failed login', async () => {
    client.post.mockResolvedValueOnce({
      data: { status: 0, msg: 'incorrect' }
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
