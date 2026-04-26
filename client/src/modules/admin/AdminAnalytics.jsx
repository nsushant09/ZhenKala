import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiDollarSign, FiTruck, FiShoppingBag, FiInfo } from 'react-icons/fi';
import api from '@/services/api';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/analytics');
            setAnalytics(data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load sales analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-32 text-center bg-background min-h-screen">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full mb-4"></div>
                <p className="garamond text-xl text-gray-400">Calculating your prosperity...</p>
            </div>
        </div>
    );

    const statCards = [
        { title: "Total Revenue", value: `$${analytics?.totalSales?.toLocaleString() || 0}`, icon: FiDollarSign, color: "text-green-600", bg: "bg-green-50" },
        { title: "COGS", value: `$${analytics?.totalItemCost?.toLocaleString() || 0}`, icon: FiShoppingBag, color: "text-orange-600", bg: "bg-orange-50", tooltip: "Cost of Goods Sold" },
        { title: "Shipping Revenue", value: `$${analytics?.totalShippingRevenue?.toLocaleString() || 0}`, icon: FiTruck, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Actual Ship Cost", value: `$${analytics?.totalActualShippingCost?.toLocaleString() || 0}`, icon: FiTruck, color: "text-red-500", bg: "bg-red-50", tooltip: "Direct costs paid to couriers" },
        { title: "Orders Formed", value: analytics?.totalOrders || 0, icon: FiTrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="p-12 bg-background min-h-screen font-primary">
            <div className="max-w-7xl mx-auto">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-10 hover:opacity-70 transition-opacity"
                >
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <div className="mb-12 border-b border-secondary/10 pb-8">
                    <h1 className="text-5xl font-secondary text-gray-800 garamond mb-2">Sales Analytics</h1>
                    <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em] opacity-80">Business Performance & Profitability</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {/* Net Profit Hero Card */}
                <div className="bg-secondary p-12 rounded-sm shadow-2xl relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FiTrendingUp size={180} className="text-white" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Current Sanctuary Net Profit</p>
                        <h2 className="text-7xl font-secondary text-white garamond mb-6 transition-all duration-700">
                            ${analytics?.netProfit?.toLocaleString() || 0}
                        </h2>
                        <div className="flex items-center gap-3 text-white/80 text-xs font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            <FiInfo size={14} />
                            <span>Calculated as: Total Revenue - (Cost of Goods + Actual Shipping Costs)</span>
                        </div>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="bg-white/40 backdrop-blur-sm p-8 rounded-sm border border-secondary/5 shadow-sm group hover:bg-white transition-all">
                            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <card.icon size={20} />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{card.title}</p>
                            <h3 className="text-2xl font-secondary text-gray-800 garamond">{card.value}</h3>
                            {card.tooltip && (
                                <p className="mt-4 text-[9px] text-gray-300 font-medium italic">{card.tooltip}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Performance Context */}
                <div className="mt-16 bg-white/20 backdrop-blur-md p-10 border border-secondary/5 rounded-sm">
                    <h3 className="garamond text-2xl text-gray-800 mb-6">Financial Reconciliation</h3>
                    <div className="space-y-4 text-[13px] text-gray-500 leading-loose max-w-2xl">
                        <p>
                            The <span className="text-secondary font-bold">Net Profit</span> reflects the actual surplus remaining after accounting for item acquisition/production costs and the direct expenses incurred during delivery.
                        </p>
                        <p>
                            Note: This figure does not include general operational costs, marketing expenses, or tax liabilities. Ensure all <span className="font-bold">Actual Shipping Costs</span> are entered in the Order Management section after dispatch for precise reporting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
