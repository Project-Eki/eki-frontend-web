import React, { useState } from 'react';
import { 
  Search, Filter, LayoutGrid, List, ArrowUpDown, 
  Plus, Bell, Package, Eye, AlertTriangle, CheckCircle,
  Upload, Trash2, X, Settings, LogOut, Tag, Info
} from 'lucide-react';

const ProductDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initializing with an empty list as requested (no dummy data)
  const products = [];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-700">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6">
          <div className="bg-emerald-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg">ë</div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<Package size={18}/>} label="Products" active />
          <NavItem icon={<Settings size={18}/>} label="Services" />
          <NavItem icon={<List size={18}/>} label="Orders" />
          <NavItem icon={<Plus size={18}/>} label="Payments" />
          <NavItem icon={<Search size={18}/>} label="Reviews and Ratings" />
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-1">
          <NavItem icon={<Settings size={18}/>} label="Store Settings" />
          <NavItem icon={<LogOut size={18}/>} label="Log out" color="text-red-500" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-8 gap-6 sticky top-0 z-20">
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-3 border-l pl-6">
            <span className="text-sm font-bold text-slate-800">Andrew</span>
            <img src="https://ui-avatars.com/api/?name=Andrew&background=0b5d51&color=fff" className="w-8 h-8 rounded-full border border-gray-200" alt="profile" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Header Section with "Add New Product" Button Below Navbar */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your inventory, pricing, and visibility across the marketplace.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0b5d51] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#084a41] transition shadow-sm font-bold text-sm"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            <StatCard title="Total Products" value="0" sub="0 added this week" icon={<Package className="text-emerald-600"/>} trend="0% vs last month" />
            <StatCard title="Active Listings" value="0" sub="0% visibility rate" icon={<Eye className="text-emerald-600"/>} />
            <StatCard title="Low Stock Alerts" value="0" sub="Healthy status" icon={<AlertTriangle className="text-amber-500"/>} />
            <StatCard title="In Stock" value="0" sub="No inventory yet" icon={<CheckCircle className="text-emerald-600"/>} />
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm flex items-center justify-between">
            <div className="flex gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by title or SKU..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 ring-emerald-500 outline-none transition" 
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-gray-50">
                <Filter size={16} /> Filters
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-400">View:</span>
              <div className="flex border border-gray-200 rounded-lg">
                <button className="p-2 border-r border-gray-200 bg-gray-50"><LayoutGrid size={18} /></button>
                <button className="p-2 border-r border-gray-200"><List size={18} className="text-gray-400" /></button>
                <button className="p-2"><ArrowUpDown size={18} className="text-gray-400" /></button>
              </div>
            </div>
          </div>

          {/* Product Grid / Empty State */}
          <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Package size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products listed</h3>
            <p className="text-gray-400 text-sm max-w-xs text-center mt-1">Your inventory is currently empty. Click the button above to add your first product.</p>
          </div>

          {/* Pagination Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <p className="text-gray-400 text-xs font-medium tracking-tight">Showing 0 of 0 products</p>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-400 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <footer className="mt-auto bg-[#134e48] text-white p-4 flex justify-between items-center text-[10px] font-medium">
          <p>Buy Smart. Sell Fast. Grow Together...</p>
          <p>© 2026 Vendor Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Support</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Ijoema ltd</span>
          </div>
        </footer>
      </main>

      {/* POP-UP MODAL - CREATE NEW PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Create New Product</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Fill in the details below to list a new product in your store catalog.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Product Info Section */}
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Product Title</label>
                  <input type="text" placeholder="e.g. Premium Wireless Headphones" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Category</label>
                  <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 outline-none cursor-pointer text-sm">
                    <option>Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Base Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" placeholder="0.00" className="w-full pl-8 p-3 border border-gray-200 rounded-xl bg-gray-50/50 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">SKU</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="PRD-XXXX" className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50/50 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Inventory Quantity</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded">
                      <Package className="text-gray-400" size={14} />
                    </div>
                    <input type="number" placeholder="0" className="w-full pl-11 p-3 border border-gray-200 rounded-xl bg-gray-50/50 outline-none text-sm" />
                  </div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-3 tracking-wider">Product Images</label>
                <div className="flex gap-4">
                  <button className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/20 transition group">
                    <Upload size={24} className="mb-1" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </button>
                  <div className="w-28 h-28 border border-gray-100 rounded-xl bg-gray-50/50"></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-medium tracking-tight">
                   <span className="bg-gray-100 px-1 rounded mr-1">i</span> Recommended size: 1200 x 1200px. Max 5MB.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Product Description</label>
                <textarea rows="4" placeholder="Describe your product's key features, benefits, and specifications..." className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white outline-none resize-none transition text-sm"></textarea>
              </div>

              {/* Variants */}
              <div className="bg-gray-50/30 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                    <LayoutGrid size={16} className="text-emerald-600"/> Product Variants
                  </h3>
                  <button className="text-[11px] font-bold py-1.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition active:scale-95">
                    + Add Variant
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-gray-300 border border-dashed border-gray-200 rounded-xl bg-white/50">
                  <p className="text-[11px] font-bold">No variants added yet</p>
                </div>
              </div>

              {/* Toggle publish */}
              <div className="flex items-center justify-between bg-white border border-gray-200 p-5 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Publish Status</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Make this product visible to customers immediately.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black border border-gray-100 rounded bg-gray-50 px-2 py-1 uppercase text-gray-300">Published</span>
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                  <CheckCircle size={10} /> All changes are automatically saved to drafts...
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition">Cancel</button>
                  <button className="px-8 py-2.5 bg-[#f0ad4e] text-white rounded-xl text-sm font-bold hover:bg-[#ec971f] shadow-lg shadow-amber-500/20 transition active:scale-95">Publish Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active, color = "text-gray-500" }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-[#0b4d45] text-white shadow-md' : `${color} hover:bg-gray-100 hover:text-slate-800`}`}>
    <div className={active ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}>{icon}</div>
    <span className="text-sm font-bold tracking-tight">{label}</span>
    {active && <div className="ml-auto w-1 h-4 bg-emerald-400 rounded-full"></div>}
  </div>
);

const StatCard = ({ title, value, sub, icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">{icon}</div>
      {trend && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">{trend}</span>}
    </div>
    <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none">{title}</h4>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-800">{value}</span>
    </div>
    <p className="text-[11px] text-gray-400 mt-1 font-medium tracking-tight">{sub}</p>
  </div>
);

export default ProductDashboard;