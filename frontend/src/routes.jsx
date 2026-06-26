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
import UserList from './pages/User/UserList';
import UserForm from './pages/User/UserForm';
import UserTypeList from './pages/UserType/UserTypeList';
import UserTypeForm from './pages/UserType/UserTypeForm';
import UserScreenList from './pages/UserScreen/UserScreenList';
import UserScreenForm from './pages/UserScreen/UserScreenForm';
import UserPermissionList from './pages/UserPermission/UserPermissionList';
import UserPermissionForm from './pages/UserPermission/UserPermissionForm';
import ScreeningProcessList from './pages/ScreeningProcess/ScreeningProcessList';
import ScreeningProcessForm from './pages/ScreeningProcess/ScreeningProcessForm';
import EggProcessList from './pages/EggProcess/EggProcessList';
import EggProcessForm from './pages/EggProcess/EggProcessForm';
import CullingProcessList from './pages/CullingProcess/CullingProcessList';
import CullingProcessForm from './pages/CullingProcess/CullingProcessForm';
import OvenProcessList from './pages/OvenProcess/OvenProcessList';
import OvenProcessForm from './pages/OvenProcess/OvenProcessForm';
import DryProcessList from './pages/DryProcess/DryProcessList';
import DryProcessForm from './pages/DryProcess/DryProcessForm';
import LeachateList from './pages/Leachate/LeachateList';
import LeachateForm from './pages/Leachate/LeachateForm';
import MaterialReceivedList from './pages/MaterialReceived/MaterialReceivedList';
import MaterialReceivedForm from './pages/MaterialReceived/MaterialReceivedForm';
import StatusUpdateList from './pages/StatusUpdate/StatusUpdateList';
import StatusUpdateForm from './pages/StatusUpdate/StatusUpdateForm';
import FrpTrayProcessList from './pages/FrpTrayProcess/FrpTrayProcessList';
import FrpTrayProcessForm from './pages/FrpTrayProcess/FrpTrayProcessForm';
import PitStatusList from './pages/PitStatus/PitStatusList';
import PitStatusForm from './pages/PitStatus/PitStatusForm';
import FrpStatusUpdateList from './pages/FrpStatusUpdate/FrpStatusUpdateList';
import FrpStatusUpdateForm from './pages/FrpStatusUpdate/FrpStatusUpdateForm';
import LogsheetList from './pages/Logsheet/LogsheetList';
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
      { path: 'user/list', element: <UserList /> },
      { path: 'user/form', element: <UserForm /> },
      { path: 'user_type/list', element: <UserTypeList /> },
      { path: 'user_type/form', element: <UserTypeForm /> },
      { path: 'user_permission/list', element: <UserPermissionList /> },
      { path: 'user_permission/form', element: <UserPermissionForm /> },
      { path: 'user_screen/list', element: <UserScreenList /> },
      { path: 'user_screen/form', element: <UserScreenForm /> },
      { path: 'screening_process/list', element: <ScreeningProcessList /> },
      { path: 'screening_process/form', element: <ScreeningProcessForm /> },
      { path: 'egg_process/list', element: <EggProcessList /> },
      { path: 'egg_process/form', element: <EggProcessForm /> },
      { path: 'culling_process/list', element: <CullingProcessList /> },
      { path: 'culling_process/form', element: <CullingProcessForm /> },
      { path: 'oven_process/list', element: <OvenProcessList /> },
      { path: 'oven_process/form', element: <OvenProcessForm /> },
      { path: 'dry_process/list', element: <DryProcessList /> },
      { path: 'dry_process/form', element: <DryProcessForm /> },
      { path: 'leachate/list', element: <LeachateList /> },
      { path: 'leachate/form', element: <LeachateForm /> },
      { path: 'material_received/list', element: <MaterialReceivedList /> },
      { path: 'material_received/form', element: <MaterialReceivedForm /> },
      { path: 'status_update/list', element: <StatusUpdateList /> },
      { path: 'status_update/form', element: <StatusUpdateForm /> },
      { path: 'pit_status/list', element: <PitStatusList /> },
      { path: 'pit_status/form', element: <PitStatusForm /> },
      { path: 'frp_tray_process/list', element: <FrpTrayProcessList /> },
      { path: 'frp_tray_process/form', element: <FrpTrayProcessForm /> },
      { path: 'frp_status_update/list', element: <FrpStatusUpdateList /> },
      { path: 'frp_status_update/form', element: <FrpStatusUpdateForm /> },
      { path: 'logsheet/list', element: <LogsheetList /> },
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