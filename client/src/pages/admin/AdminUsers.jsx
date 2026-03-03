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
import api from '../../services/api';

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
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm">
              Manage customer accounts and administrative roles
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-black/10 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow max-w-md w-full">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-primary border border-black/10 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-xl shadow-lg border border-black/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary text-black uppercase text-xs font-semibold tracking-wider border-b border-black/10">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-primary-light/10">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-black/5 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <FiUser size={16} />
                          </div>
                          <span className="font-medium text-black">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3 text-right flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openRoleModal(user)}
                          className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                          title="Edit Role"
                        >
                          <FiEdit size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                          title="Delete User"
                        >
                          <FiTrash2 size={18} />
                        </button>
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
