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
    <div className="p-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
        >
          <FiArrowLeft /> Back to Sanctuary
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 border-b border-secondary/10 pb-6 gap-4">
          <div>
            <h1 className="text-5xl font-secondary text-gray-800 garamond italic mb-1">Acquisitions</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Managing the flow of sacred art across the world
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-sm border border-secondary/5 mb-10 flex flex-col md:flex-row gap-6 items-center shadow-sm">
          <div className="relative flex-grow max-w-md w-full">
            <input
              type="text"
              placeholder="Search by Order ID or Patron Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-secondary transition-all"
            />
            <FiSearch className="absolute right-3 top-3.5 text-gray-300" size={16} />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-sm text-sm text-gray-500 font-bold uppercase tracking-widest focus:outline-none focus:border-secondary transition-all w-full md:w-64"
          >
            <option value="all">All States of Being</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white/60 backdrop-blur-lg rounded-sm border border-secondary/5 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-32 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full mb-4"></div>
                <p className="garamond italic text-xl text-gray-400">Restoring the scrolls...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-32 text-center">
              <p className="garamond italic text-xl text-gray-400">No acquisitions found in this realm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary text-white uppercase text-[10px] font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Order Reference</th>
                    <th className="px-8 py-5">Patron</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Value</th>
                    <th className="px-8 py-5">Payment</th>
                    <th className="px-8 py-5">Harmony</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-secondary/5 font-primary">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="px-8 py-6 font-mono text-[11px] text-gray-500 uppercase">
                        #{order._id.substring(order._id.length - 8)}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{order.user?.name || 'Guest User'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{order.user?.email}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="px-8 py-6 font-bold text-gray-800 text-sm">
                        ${order.totalPrice.toLocaleString()}
                      </td>

                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.isPaid ? 'border-green-200 text-green-600 bg-green-50' : 'border-red-200 text-red-600 bg-red-50'}`}>
                          {order.isPaid ? 'Energy Received' : 'Awaiting Flow'}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-500' : 'bg-secondary'}`}></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                            {order.orderStatus}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-secondary hover:bg-secondary hover:text-white transition-all p-2 rounded-full"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openStatusModal(order)}
                            className="text-gray-400 hover:bg-gray-100 transition-all p-2 rounded-full"
                            title="Update Status"
                          >
                            <FiTruck size={16} />
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

