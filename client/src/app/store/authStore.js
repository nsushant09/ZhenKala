import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,

  initialize: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    let parsedUser = null;
    if (storedUser && storedToken) {
      parsedUser = JSON.parse(storedUser);
    }

    set({
      user: parsedUser,
      loading: false,
      isAuthenticated: !!parsedUser,
      isAdmin: parsedUser?.role === 'admin',
    });
  },

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({
      user: userData,
      isAuthenticated: true,
      isAdmin: userData?.role === 'admin',
    });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  updateUser: (updatedData) => {
    const { user } = get();
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({
      user: updatedUser,
      isAuthenticated: !!updatedUser,
      isAdmin: updatedUser?.role === 'admin',
    });
  },
}));
