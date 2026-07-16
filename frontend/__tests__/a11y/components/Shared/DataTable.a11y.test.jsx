import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DataTable from '../../../../src/components/DataTable';
import djangoClient from '../../../../src/api/djangoClient';

expect.extend(toHaveNoViolations);

const columns = [
  { label: 'Item Code', key: 'item_code' },
  { label: 'Item Name', key: 'item_name' },
  { label: 'Status', key: 'is_active', render: (v) => (v ? 'Active' : 'Inactive') },
];

describe('A11y: DataTable Component', () => {
  beforeEach(() => {
    vi.spyOn(djangoClient, 'get').mockResolvedValue({
      data: {
        status: 1,
        msg: 'success',
        data: {
          count: 1,
          results: [
            { unique_id: 'IT-001', item_code: 'IT-001', item_name: 'Item A', is_active: true },
          ],
        },
        error: '',
      },
    });
  });

  test('has no WCAG violations', async () => {
    const { container } = render(
      <DataTable mode="django" ajaxUrl="/items" columns={columns} />
    );
    await screen.findByText('Item A');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('table has thead with th elements', async () => {
    render(<DataTable mode="django" ajaxUrl="/items" columns={columns} />);
    await screen.findByText('Item A');
    const headers = document.querySelectorAll('table th');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('data rows render in tbody', async () => {
    render(<DataTable mode="django" ajaxUrl="/items" columns={columns} />);
    const cell = await screen.findByText('Item A');
    expect(cell.closest('tbody')).toBeTruthy();
  });
});
