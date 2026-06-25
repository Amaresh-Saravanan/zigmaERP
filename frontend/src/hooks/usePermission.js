import useAuth from './useAuth';

export default function usePermission(screenId) {
  const { user } = useAuth();
  if (!user) return false;
  // Screens might be returned as comma-separated string or array.
  // In menu_permission, screens is returned as array (from array_implode / GROUP_CONCAT).
  // Let's support both array and string representation for safety.
  if (Array.isArray(user.screens)) {
    return user.screens.includes(screenId);
  }
  if (typeof user.screens === 'string') {
    return user.screens.split(',').includes(screenId);
  }
  return false;
}
