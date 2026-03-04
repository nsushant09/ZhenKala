import React from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiUsers, FiSettings, FiCreditCard } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <div className="p-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-secondary/10 pb-8">
          <h1 className="text-5xl font-secondary text-gray-800 garamond mb-2 italic">Admin Sanctuary</h1>
          <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em] opacity-80">Overseeing the Art & Craft of ZhenKala</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { to: "/admin/products", icon: FiBox, title: "Artistic Inventory", desc: "Curate your collection of thangkas, handicrafts, and sacred objects.", label: "Curate" },
            { to: "/admin/orders", icon: FiShoppingBag, title: "Order Flow", desc: "Monitor sacred acquisitions and track the journey of your products.", label: "Fulfill" },
            { to: "/admin/users", icon: FiUsers, title: "Art Patrons", desc: "Manage your community of collectors and manage their access.", label: "Connect" },
            { to: "/admin/settings", icon: FiSettings, title: "Business Essence", desc: "Refine your merchant details, banking, and invoice identity.", label: "Refine" },
            { to: "/admin/payment", icon: FiCreditCard, title: "Gateway Portals", desc: "Oversee the digital flow of energy via Stripe, PayPal, and more.", label: "Flow" },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="bg-white/40 backdrop-blur-sm p-10 rounded-sm border border-secondary/5 hover:border-secondary/20 hover:shadow-2xl hover:bg-white transition-all group relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <item.icon size={80} className="text-secondary" />
              </div>

              <div className="mb-8 p-5 bg-secondary text-white rounded-full transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-secondary/20 relative z-10">
                <item.icon size={28} />
              </div>

              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 relative z-10">{item.label}</span>
              <h3 className="text-2xl font-secondary text-gray-800 mb-4 garamond group-hover:text-secondary transition-colors relative z-10">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed relative z-10">{item.desc}</p>

              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <span className="text-secondary font-bold text-[10px] uppercase tracking-widest border-b border-secondary pb-1">Enter Portal</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Overview Stats */}
        <div className="mt-24">
          <div className="flex items-baseline justify-between mb-10 border-b border-secondary/5 pb-4">
            <h2 className="text-3xl font-secondary text-gray-800 garamond italic">Insight & Harmony</h2>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Business Analytics</span>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-16 rounded-sm border border-secondary/5 text-center text-gray-400">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-[1px] bg-secondary/20 mx-auto mb-8"></div>
              <p className="italic garamond text-xl text-gray-500 mb-2">"Vision is the art of seeing things invisible."</p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300">Statistics will appear as your collection grows</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
