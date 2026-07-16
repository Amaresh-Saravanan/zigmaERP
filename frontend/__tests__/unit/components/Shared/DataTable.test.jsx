import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DataTable from '../../../../src/components/DataTable';
import djangoClient from '../../../../src/api/djangoClient';

describe('Unit: DataTable Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(djangoClient, 'get');
  });

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Name', key: 'item_name' },
    { label: 'Status', key: 'is_active', render: (v) => (v ? 'Active' : 'Inactive') },
  ];

  test('renders column headers', () => {
    render(<DataTable mode="django" ajaxUrl="/items" columns={columns} />);
    expect(screen.getByText('S.No')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('shows rows fetched from backend', async () => {
    djangoClient.get.mockResolvedValue({
      data: {
        status: 1,
        msg: 'success',
        data: {
          count: 1,
          results: [
            { unique_id: '1', item_name: 'Item 1', is_active: true },
          ],
        },
        error: '',
      },
    });

    render(<DataTable mode="django" ajaxUrl="/items" columns={columns} />);

    await waitFor(() => {
      expect(screen.getByText(/Item 1/i)).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: /Active/i })).toBeInTheDocument();
    });
  });

  test('filters on search input', async () => {
    djangoClient.get.mockResolvedValue({
      data: {
        status: 1,
        msg: 'success',
        data: {
          count: 2,
          results: [
            { unique_id: '1', item_name: 'Filtered Item', is_active: true },
          ],
        },
        error: '',
      },
    });

    render(<DataTable mode="django" ajaxUrl="/items" columns={columns} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Filtered');

    await waitFor(() => {
      expect(djangoClient.get).toHaveBeenCalledWith('/items', {
        params: expect.objectContaining({ search: 'Filtered' }),
      });
      expect(screen.getByText(/Filtered Item/i)).toBeInTheDocument();
    });
  });
});
