import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import FormHeader from './FormHeader';

describe('FormHeader', () => {
  it('renders the title and navigates to backTo when clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/item_creation/form']}>
        <Routes>
          <Route path="/item_creation/form" element={<FormHeader title="New Item" backTo="/item_creation/list" />} />
          <Route path="/item_creation/list" element={<div>Item List Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'New Item' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /back to list/i }));

    expect(screen.getByText('Item List Page')).toBeInTheDocument();
  });
});
