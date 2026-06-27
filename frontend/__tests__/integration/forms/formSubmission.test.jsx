import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ItemCreationForm from '../../../src/pages/ItemCreation/ItemCreationForm';
import { AuthProvider } from '../../../src/context/AuthContext';

const renderForm = () => render(
  <BrowserRouter>
    <AuthProvider>
      <ItemCreationForm />
    </AuthProvider>
  </BrowserRouter>
);

describe('Integration: Form Submission', () => {
  test('submits form with valid data', async () => {
    renderForm();
    
    await waitFor(() => {
      expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/item name/i), 'New Item');
    await userEvent.type(screen.getByLabelText(/item code/i), 'IT-004');
    
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
  });
});
