import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DataTable from '../../../../src/components/DataTable';
import client from '../../../../src/api/client';

describe('Unit: DataTable Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(client, 'post');
  });

  const columns = [
    { label: 'S.No' },
    { label: 'Name' },
    { label: 'Status' }
  ];

  test('renders column headers', () => {
    render(<DataTable ajaxUrl="test/url" columns={columns} />);
    expect(screen.getByText('S.No')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('shows rows fetched from backend', async () => {
    client.post.mockResolvedValue({
      data: {
        draw: 1,
        recordsTotal: 1,
        recordsFiltered: 1,
        data: [
          [1, 'Item 1', 'Active']
        ]
      }
    });

    render(<DataTable ajaxUrl="test/url" columns={columns} />);

    await waitFor(() => {
      expect(screen.getByText(/Item 1/i)).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: /Active/i })).toBeInTheDocument();
    });
  });

  test('filters on search input', async () => {
    client.post.mockResolvedValue({
      data: {
        draw: 1,
        recordsTotal: 2,
        recordsFiltered: 1,
        data: [
          [1, 'Filtered Item', 'Active']
        ]
      }
    });

    render(<DataTable ajaxUrl="test/url" columns={columns} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Filtered');

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('test/url', expect.any(URLSearchParams));
      expect(screen.getByText(/Filtered Item/i)).toBeInTheDocument();
    });
  });
});
