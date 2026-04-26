import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  return useAuthStore();
};

export const AuthProvider = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

export default { useAuth, AuthProvider };
