import { renderHook } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import usePermission from '../../../src/hooks/usePermission';
import useAuth from '../../../src/hooks/useAuth';

vi.mock('../../../src/hooks/useAuth');

describe('Unit: usePermission Hook', () => {
  test('returns false when no user is authenticated', () => {
    useAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => usePermission('us_user'));
    expect(result.current).toBe(false);
  });

  test('returns true when user has screen ID', () => {
    useAuth.mockReturnValue({ 
      user: { screens: ['us_user', 'us_item'] } 
    });
    const { result } = renderHook(() => usePermission('us_user'));
    expect(result.current).toBe(true);
  });

  test('returns false when user lacks screen ID', () => {
    useAuth.mockReturnValue({ 
      user: { screens: ['us_item'] } 
    });
    const { result } = renderHook(() => usePermission('us_user'));
    expect(result.current).toBe(false);
  });

  test('handles comma-separated string screens correctly', () => {
    useAuth.mockReturnValue({ 
      user: { screens: 'us_user,us_item' } 
    });
    const { result } = renderHook(() => usePermission('us_item'));
    expect(result.current).toBe(true);
  });
});
