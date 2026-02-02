import React from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiSettings } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Products Card */}
          <Link to="/admin/products" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FiBox size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Manage</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Products</h3>
            <p className="text-gray-500 text-sm">Add, edit, and manage your inventory, variants, and stock.</p>
          </Link>

          {/* Orders Card */}
          <Link to="/admin/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <FiShoppingBag size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Manage</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Orders</h3>
            <p className="text-gray-500 text-sm">View and process customer orders, track status and refunds.</p>
          </Link>

          {/* Users Card */}
          <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                <FiUsers size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Manage</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Users</h3>
            <p className="text-gray-500 text-sm">Manage customer accounts, roles, and permissions.</p>
          </Link>

          {/* Settings Card (Placeholder) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-70 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
                <FiSettings size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Soon</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Settings</h3>
            <p className="text-gray-500 text-sm">Site configuration, email settings, and global parameters.</p>
          </div>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            <p>Statistics and charts will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
