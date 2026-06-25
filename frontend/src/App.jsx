import { RouterProvider } from 'react-router-dom';
import router from './routes';

// ponytail: App is just the router shell — all layout/auth lives inside routes
export default function App() {
  return <RouterProvider router={router} />;
}
