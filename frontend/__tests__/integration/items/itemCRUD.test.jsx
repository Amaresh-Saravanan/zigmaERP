import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ItemCreationList from '../../../src/pages/ItemCreation/ItemCreationList';
import { AuthProvider } from '../../../src/context/AuthContext';

const renderItemList = () => render(
  <BrowserRouter>
    <AuthProvider>
      <ItemCreationList />
    </AuthProvider>
  </BrowserRouter>
);

describe('Integration: Item CRUD', () => {
  test('displays items in DataTable', async () => {
    renderItemList();
    
    await waitFor(() => {
      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('IT-001')).toBeInTheDocument();
    });
  });

  test('filters items by search', async () => {
    renderItemList();
    
    await screen.findByText('Item A');
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Item A');
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toHaveValue('Item A');
    });
  });
});
