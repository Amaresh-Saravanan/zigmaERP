import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../../../src/components/Layout/Sidebar';
import useAuth from '../../../../src/hooks/useAuth';
import client from '../../../../src/api/client';

vi.mock('../../../../src/hooks/useAuth');

describe('Unit: Sidebar Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(client, 'get');
  });

  const renderSidebar = () => render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );

  const mockMenu = [
    { unique_id: 'msm_hatching', screen_main_name: 'Hatching Center', sub_screens: [
      { unique_id: 'us_egg', screen_name: 'Egg Process', folder_name: 'egg_process' },
      { unique_id: 'us_culling', screen_name: 'Culling Process', folder_name: 'culling_process' }
    ]},
    { unique_id: 'msm_admin', screen_main_name: 'Admin', sub_screens: [
      { unique_id: 'us_user', screen_name: 'User', folder_name: 'user' }
    ]}
  ];

  test('renders items user has main screen access to (worker)', async () => {
    useAuth.mockReturnValue({
      user: {
        userType: '6213273aa04b228161',
        mainScreens: ['msm_hatching'],
        screens: ['us_egg']
      }
    });

    client.get.mockResolvedValueOnce({
      data: { status: 1, menu: mockMenu }
    });

    renderSidebar();

    await waitFor(() => {
      expect(screen.queryByText('Dashboards')).not.toBeInTheDocument();
      expect(screen.getByText('Egg Process')).toBeInTheDocument();
      expect(screen.queryByText('Culling Process')).not.toBeInTheDocument();
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

    client.get.mockResolvedValueOnce({
      data: { status: 1, menu: mockMenu }
    });

    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'User' })).toBeInTheDocument();
    });
  });
});
