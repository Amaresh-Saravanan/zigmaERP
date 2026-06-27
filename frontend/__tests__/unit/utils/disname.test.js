import { describe, test, expect } from 'vitest';
import disname from '../../../src/utils/disname';

describe('Unit: disname Util', () => {
  test('converts snake_case to Title Case', () => {
    expect(disname('user_name')).toBe('User Name');
    expect(disname('item_creation')).toBe('Item Creation');
    expect(disname('tray_view')).toBe('Tray View');
  });

  test('returns empty string for empty input', () => {
    expect(disname('')).toBe('');
    expect(disname(null)).toBe('');
    expect(disname(undefined)).toBe('');
  });
});
