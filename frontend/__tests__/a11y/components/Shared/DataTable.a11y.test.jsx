import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DataTable from '../../../../src/components/DataTable';
import client from '../../../../src/api/client';

expect.extend(toHaveNoViolations);

const columns = [
  { label: 'Item Code' },
  { label: 'Item Name' },
  { label: 'Status' },
];

describe('A11y: DataTable Component', () => {
  beforeEach(() => {
    vi.spyOn(client, 'post').mockResolvedValue({
      data: {
        draw: 1,
        recordsTotal: 1,
        recordsFiltered: 1,
        data: [['IT-001', 'Item A', 'Active']]
      }
    });
  });

  test('has no WCAG violations', async () => {
    const { container } = render(
      <DataTable ajaxUrl="folders/item_creation/crud.php" columns={columns} />
    );
    await screen.findByText('Item A');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('table has thead with th elements', async () => {
    render(<DataTable ajaxUrl="folders/item_creation/crud.php" columns={columns} />);
    await screen.findByText('Item A');
    const headers = document.querySelectorAll('table th');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('data rows render in tbody', async () => {
    render(<DataTable ajaxUrl="folders/item_creation/crud.php" columns={columns} />);
    const cell = await screen.findByText('Item A');
    expect(cell.closest('tbody')).toBeTruthy();
  });
});
