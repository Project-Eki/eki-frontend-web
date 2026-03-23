import React, { useState } from "react";
import Sidebar from "../components/Vendormanagement/Sidebar";
import Navbar from "../components/Vendormanagement/Navbar";
import ServiceForm from "../components/Vendormanagement/ServiceForm";
import Footer from "../components/Vendormanagement/footer";

import {
  Plus, X, Briefcase, LayoutGrid, List,
  Clock, Calendar, Star, CheckCircle, ChevronDown,
  Search, SlidersHorizontal, Globe, MapPin
} from 'lucide-react';

/* ── stat cards ── */
const STATS = [
  { label: "Total Services", value: "24",    icon: <Briefcase size={18} />,   color: "teal"   },
  { label: "Active Now",     value: "18",    icon: <CheckCircle size={18} />, color: "green"  },
  { label: "Total Bookings", value: "1,240", icon: <Calendar size={18} />,    color: "amber"  },
  { label: "Average Rating", value: "4.9",   icon: <Star size={18} />,        color: "purple" },
];

const colorMap = {
  teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   val: "text-teal-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  val: "text-green-700"  },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  val: "text-amber-700"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", val: "text-purple-700" },
};

const MOCK = [
  { id:1, category:"CONSULTING",   title:"Executive Business Coaching",      desc:"One-on-one strategic sessions for senior leadership.",              price:150, unit:"session", duration:"60 min",  avail:"Available",    status:"active", mode:"remote",    img:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" },
  { id:2, category:"CREATIVE",     title:"Professional Photography Session", desc:"High-end corporate headshots with professional post-processing.",    price:299, unit:"session", duration:"120 min", avail:"Limited",      status:"active", mode:"in-person", img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
  { id:3, category:"IT SERVICES",  title:"Full-Stack Web Development",       desc:"Custom React and Node.js apps from architecture to deployment.",     price:85,  unit:"hourly",  duration:"Hourly",  avail:"Fully Booked", status:"paused", mode:"remote",    img:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80" },
  { id:4, category:"HOME & LIVING",title:"Interior Design Consultation",     desc:"Expert spatial planning for residential and office environments.",   price:120, unit:"session", duration:"90 min",  avail:"Available",    status:"active", mode:"in-person", img:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" },
  { id:5, category:"MARKETING",    title:"Brand Identity Workshop",          desc:"Collaborative workshop to define brand values and visual guidelines.",price:450, unit:"session", duration:"4 hours", avail:"Available",    status:"draft",  mode:"remote",    img:"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80" },
  { id:6, category:"IT SERVICES",  title:"Technical Support Retainer",      desc:"Priority 24/7 technical support and maintenance for enterprise.",    price:500, unit:"monthly", duration:"Monthly", avail:"Available",    status:"active", mode:"remote",    img:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
];

const STATUS_STYLE = {
  active: "bg-green-50 text-green-700 border border-green-200",
  paused: "bg-gray-100 text-gray-500 border border-gray-200",
  draft:  "bg-amber-50 text-amber-700 border border-amber-200",
};
const AVAIL_COLOR = { "Fully Booked": "text-red-500", "Limited": "text-amber-500" };

// s means one service object
const ServiceCard = ({ s }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-44 overflow-hidden">
      <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        {s.mode === "remote" ? <Globe size={9}/> : <MapPin size={9}/>} {s.mode}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-gray-400 tracking-widest">{s.category}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLE[s.status]}`}>{s.status}</span>
      </div>
      <h3 className="font-black text-[15px] text-gray-900 leading-tight mb-1">{s.title}</h3>
      <p className="text-[12px] text-gray-500 line-clamp-2 mb-3">{s.desc}</p>
      <div className="flex items-center justify-between text-[12px] text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={12}/> {s.duration}</span>
        <span className={`flex items-center gap-1 font-semibold ${AVAIL_COLOR[s.avail] || "text-gray-400"}`}>
          <Calendar size={12}/> {s.avail}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <span className="text-[21px] font-black text-gray-900">${s.price}</span>
          <span className="text-[11px] text-gray-400">/{s.unit}</span>
        </div>
        <button className="text-[12px] font-bold text-teal-700 hover:text-amber-500 transition-colors flex items-center gap-1">
          View Full Details <span className="text-[10px]">↗</span>
        </button>
      </div>
    </div>
  </div>
);
// main component
const ServiceManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode]       = useState("grid");
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("newest");
// filtering data
  const filtered = MOCK.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // OUTER: full viewport height, no overflow — nothing on this level scrolls
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* Navbar — fixed height, never scrolls */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* MIDDLE ROW: sidebar + right column, fills remaining height */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — full height of this row, never scrolls independently */}
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* RIGHT COLUMN: main content + footer, this column scrolls as one unit */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

          {/* Main content — grows to fill, no independent scroll */}
          <main className="flex-1 p-5 sm:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Service Management</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Manage your professional offerings, schedules, and service availability.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold text-sm shrink-0 w-full sm:w-auto justify-center"
                >
                  <Plus size={18} /> Create New Service
                </button>
              </div>

              {/* Search + Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter by title, category, or keyword..."
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
                    <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Advanced</span> Filters
                  </button>
                  <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="grid" ? "bg-teal-700 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                      <LayoutGrid size={15}/>
                    </button>
                    <button onClick={() => setViewMode("list")} className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="list" ? "bg-teal-700 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                      <List size={15}/>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {/* s is current item , i is index */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {STATS.map((s, i) => {
                  const c = colorMap[s.color];
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-0.5">{s.label}</p>
                        <p className={`text-[20px] sm:text-[22px] font-black leading-none ${c.val}`}>{s.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Services Grid */}
              {filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-teal-600">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Services Found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">Try a different search term or create a new service.</p>
                </div>
              ) : (
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {filtered.map(s => <ServiceCard key={s.id} s={s} />)}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Showing <b>6</b> of <b>24</b> services</p>
                <div className="flex items-center gap-1">
                  <button className="h-9 px-3 sm:px-4 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-teal-500 hover:text-teal-700 transition-colors font-medium">Previous</button>
                  {[1,2,3].map(n => (
                    <button key={n} className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${n===1 ? "bg-teal-700 text-white" : "border border-gray-200 text-gray-500 hover:border-teal-500"}`}>{n}</button>
                  ))}
                  <button className="h-9 px-3 sm:px-4 bg-teal-700 text-white rounded-lg text-sm font-bold hover:bg-teal-800 transition-colors">Next</button>
                </div>
              </div>

            </div>
          </main>

          {/* Footer — sits at the bottom of the scrollable right column */}
          <Footer />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X size={18}/>
            </button>
            <ServiceForm onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;