import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MainScreenForm from '../../../src/pages/MainScreen/MainScreenForm';

const renderForm = () => render(
  <BrowserRouter>
    <MainScreenForm />
  </BrowserRouter>
);

describe('Integration: Main Screen form validation display', () => {
  test('does not mark empty required fields invalid before any interaction', () => {
    renderForm();

    const form = screen.getByLabelText(/screen name/i).closest('form');
    expect(form).not.toHaveClass('was-validated');
  });

  test('marks fields invalid only after a submit attempt with empty required fields', async () => {
    renderForm();

    const form = screen.getByLabelText(/screen name/i).closest('form');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(form).toHaveClass('was-validated');
  });
});
