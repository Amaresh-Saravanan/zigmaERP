// ponytail: base router — only Login and Dashboard stub for now. Add routes as pages are built.
import { createBrowserRouter } from ''react-router-dom'';
import Login from ''./pages/Login'';

const router = createBrowserRouter([
  { path: ''/login'', element: <Login /> },
  // Protected routes added in TASK-007 when MainLayout is ready
]);

export default router;