import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiArrowLeft,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
  FiUser
} from 'react-icons/fi';
import api from '@/services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal for role update
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  // Modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    setUpdating(true);
    try {
      await api.put(`/users/${selectedUser._id}`, {
        role: newRole
      });

      // Update local state
      setUsers(users.map(u =>
        u._id === selectedUser._id
          ? { ...u, role: newRole }
          : u
      ));

      setShowRoleModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-12 bg-background min-h-screen font-primary">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 border-b border-secondary/10 pb-6 gap-4">
          <div>
            <h1 className="text-5xl font-secondary text-gray-800 garamond mb-1">User Management</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Manage registered user accounts and permissions
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-sm border border-secondary/5 mb-10 shadow-sm max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-secondary transition-all"
            />
            <FiSearch className="absolute right-3 top-3.5 text-gray-300" size={16} />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/60 backdrop-blur-lg rounded-sm border border-secondary/5 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-32 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full mb-4"></div>
                <p className="garamond text-xl text-gray-400">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-32 text-center">
              <p className="garamond text-xl text-gray-400">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary text-white uppercase text-[10px] font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">User</th>
                    <th className="px-8 py-5">Email Address</th>
                    <th className="px-8 py-5">Access Role</th>
                    <th className="px-8 py-5">Join Date</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-secondary/5">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20 font-bold group-hover:scale-110 transition-transform">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-gray-500 text-sm">
                        {user.email}
                      </td>

                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${user.role === 'admin' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-secondary/20 text-secondary bg-secondary/5'}`}>
                          {user.role === 'admin' ? 'Administrator' : 'General User'}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openRoleModal(user)}
                            className="text-gray-400 hover:text-secondary hover:bg-secondary/5 transition-all p-2 rounded-full"
                            title="Edit Role"
                          >
                            <FiEdit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-full"
                            title="Delete User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role Update Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update User Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Update role for <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-white bg-secondary hover:bg-opacity-90 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
              >
                {updating ? 'Updating...' : <><FiCheck /> Update Role</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
              This action cannot be undone and will remove all their information.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
