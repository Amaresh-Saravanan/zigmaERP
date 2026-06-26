import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import PlaceholderPage from './pages/PlaceholderPage';
import UnitCreationList from './pages/UnitCreation/UnitCreationList';
import UnitCreationForm from './pages/UnitCreation/UnitCreationForm';
import ItemCreationList from './pages/ItemCreation/ItemCreationList';
import ItemCreationForm from './pages/ItemCreation/ItemCreationForm';
import TrayCreationList from './pages/TrayCreation/TrayCreationList';
import TrayCreationForm from './pages/TrayCreation/TrayCreationForm';
import PitCreationList from './pages/PitCreation/PitCreationList';
import PitCreationForm from './pages/PitCreation/PitCreationForm';
import SupplierCreationList from './pages/SupplierCreation/SupplierCreationList';
import SupplierCreationForm from './pages/SupplierCreation/SupplierCreationForm';

// ponytail: Using a single PlaceholderPage component for all unmigrated screens to avoid 30+ boilerplate files.
const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PlaceholderPage /> },
      { path: 'dashboard/form', element: <Navigate to="/" replace /> },
      { path: 'item_creation/list', element: <ItemCreationList /> },
      { path: 'item_creation/form', element: <ItemCreationForm /> },
      { path: 'tray_creation/list', element: <TrayCreationList /> },
      { path: 'tray_creation/form', element: <TrayCreationForm /> },
      { path: 'unit_creation/list', element: <UnitCreationList /> },
      { path: 'unit_creation/form', element: <UnitCreationForm /> },
      { path: 'supplier_creation/list', element: <SupplierCreationList /> },
      { path: 'supplier_creation/form', element: <SupplierCreationForm /> },
      { path: 'pit_creation/list', element: <PitCreationList /> },
      { path: 'pit_creation/form', element: <PitCreationForm /> },
      { path: 'user/list', element: <PlaceholderPage /> },
      { path: 'user_type/list', element: <PlaceholderPage /> },
      { path: 'user_permission/list', element: <PlaceholderPage /> },
      { path: 'user_screen/list', element: <PlaceholderPage /> },
      { path: 'screening_process/list', element: <PlaceholderPage /> },
      { path: 'egg_process/list', element: <PlaceholderPage /> },
      { path: 'culling_process/list', element: <PlaceholderPage /> },
      { path: 'oven_process/list', element: <PlaceholderPage /> },
      { path: 'dry_process/list', element: <PlaceholderPage /> },
      { path: 'leachate/list', element: <PlaceholderPage /> },
      { path: 'material_received/list', element: <PlaceholderPage /> },
      { path: 'status_update/form', element: <PlaceholderPage /> },
      { path: 'pit_status/list', element: <PlaceholderPage /> },
      { path: 'frp_tray_process/list', element: <PlaceholderPage /> },
      { path: 'frp_status_update/list', element: <PlaceholderPage /> },
      { path: 'logsheet/list', element: <PlaceholderPage /> },
      { path: 'login_history/list', element: <PlaceholderPage /> },
      { path: 'dc/list', element: <PlaceholderPage /> },
      { path: 'measurable/list', element: <PlaceholderPage /> },
      { path: 'measurable_report/list', element: <PlaceholderPage /> },
      { path: 'egg_process_report/list', element: <PlaceholderPage /> },
      { path: 'pit_status_report/list', element: <PlaceholderPage /> },
      { path: 'rejects_report/list', element: <PlaceholderPage /> },
      { path: 'rejects_image_upload/list', element: <PlaceholderPage /> },
      { path: 'main_screen/list', element: <PlaceholderPage /> },
      { path: '*', element: <PlaceholderPage /> },
    ],
  },
]);

export default router;