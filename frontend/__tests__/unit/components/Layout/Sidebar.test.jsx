import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../../../src/components/Layout/Sidebar';
import useAuth from '../../../../src/hooks/useAuth';

vi.mock('../../../../src/hooks/useAuth');

describe('Unit: Sidebar Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const renderSidebar = () => render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );

  // Menu is now the hardcoded DEMO_MENU (no /api/menu fetch) — assert against its
  // real content instead of an injected mock.
  test('renders items for worker (hatching center screens visible)', async () => {
    useAuth.mockReturnValue({
      user: {
        userType: '6213273aa04b228161',
        mainScreens: ['msm_hatching'],
        screens: ['us_egg']
      }
    });

    renderSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Dashboards')).not.toBeInTheDocument();
      expect(screen.getByText('Egg Process')).toBeInTheDocument();
    });
  });

  test('renders Dashboard for admin', async () => {
    useAuth.mockReturnValue({
      user: {
        userType: '5f97fc3257f2525529',
        mainScreens: ['msm_admin'],
        screens: ['us_user']
      }
    });

    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'User Creation' })).toBeInTheDocument();
    });
  });
});
