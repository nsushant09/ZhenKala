import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiSearch,
  FiArrowLeft,
  FiEye,
  FiTruck,
  FiCheck,
  FiX
} from 'react-icons/fi';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal for status update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber
      });

      // Update local state
      setOrders(orders.map(o =>
        o._id === selectedOrder._id
          ? { ...o, orderStatus: newStatus, trackingNumber: trackingNumber }
          : o
      ));

      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      (order.user?.name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'processing': return 'bg-blue-500/10 text-blue-500';
      case 'shipped': return 'bg-purple-500/10 text-purple-500';
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 text-sm">
              Manage and track customer orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface p-4 rounded-xl shadow-lg border border-black/10 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow max-w-md w-full">
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-primary border border-black/10 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-primary border border-black/10 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all w-full md:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-surface rounded-xl shadow-lg border border-black/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary text-black uppercase text-xs font-semibold tracking-wider border-b border-black/10">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-primary-light/10">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-black/5 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-sm text-gray-600">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{order.user?.name || 'Guest User'}</span>
                          <span className="text-xs text-gray-500">{order.user?.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3 font-medium text-black">
                        ${order.totalPrice.toLocaleString()}
                      </td>

                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>

                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right flex items-center justify-end gap-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => openStatusModal(order)}
                          className="text-purple-500 hover:text-purple-600 transition-colors p-1"
                          title="Update Status"
                        >
                          <FiTruck size={18} />
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

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="Enter tracking number if any..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-white bg-secondary hover:bg-opacity-90 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
              >
                {updating ? 'Updating...' : <><FiCheck /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

