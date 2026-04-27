import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { Layers, CheckCircle, Clock, Flag, RefreshCw, X } from "lucide-react";
import { ServiceStatCard } from "../components/AdminServicesManagement/ServiceStatCard";
import { ServiceTable } from "../components/AdminServicesManagement/ServiceTable";
import { ServiceCategoryChart } from "../components/AdminServicesManagement/ServiceCategoryChart";
import { ServiceStatusChart } from "../components/AdminServicesManagement/ServiceStatusChart";
import { ServiceBulkActionBar } from "../components/AdminServicesManagement/ServiceBulkActionBar";

const GOLD = "#EFB034";

//Mock Data
const mockServices = [
  { id: "1", serviceId: "SRV-1024", title: "Custom Website Development (React/Next.js)", category: "Technology", billingModel: "$75/hr",    vendor: "TechFlow Studio",   buyer: "Alex Rivera",   status: "Active",   thumbnail: null },
  { id: "2", serviceId: "SRV-1025", title: "Professional Home Deep Cleaning",            category: "Home Services", billingModel: "Fixed $249",  vendor: "SparkleHome Co.",  buyer: "Sarah Jenkins", status: "Active",   thumbnail: null },
  { id: "3", serviceId: "SRV-1026", title: "Social Media Brand Identity Design",         category: "Creative",      billingModel: "Fixed $1,200",vendor: "Visionary Arts",   buyer: "—",             status: "Draft",    thumbnail: null },
  { id: "4", serviceId: "SRV-1027", title: "Corporate Legal Consulting",                 category: "Business",      billingModel: "$150/hr",    vendor: "Lexington Partners",buyer: "Michael Chen",  status: "Active",   thumbnail: null },
  { id: "5", serviceId: "SRV-1028", title: "Event Photography & Videography",            category: "Creative",      billingModel: "$200/hr",    vendor: "LensMaster Pro",   buyer: "Elena Gilbert", status: "Archived", thumbnail: null },
  { id: "6", serviceId: "SRV-1029", title: "SEO & Content Marketing Strategy",           category: "Business",      billingModel: "Fixed $800", vendor: "GrowthHive",       buyer: "Priya Patel",   status: "Flagged",  thumbnail: null },
  { id: "7", serviceId: "SRV-1030", title: "Personal Fitness Coaching (Online)",         category: "Health",        billingModel: "$50/hr",     vendor: "FitLab Studios",   buyer: "James Okafor",  status: "Active",   thumbnail: null },
];

const categories = [
  { name: "Technology",    total: 315 },
  { name: "Home Services", total: 420 },
  { name: "Creative",      total: 180 },
  { name: "Business",      total: 240 },
  { name: "Health",        total: 95  },
];

const serviceStatuses = [
  { label: "Active",   percentage: 65, color: "#EFB034" },
  { label: "Draft",    percentage: 20, color: "#235E5D" },
  { label: "Flagged",  percentage: 10, color: "#DC2626" },
  { label: "Archived", percentage: 5,  color: "#9CA3AF" },
];

//  Service Profile Modal
const ServiceProfile = ({ service, onClose, onArchive, onDelete }) => {
  const [activeTab, setActiveTab] = useState("details");

  const orders = [
    { id: "ORD-8821", buyer: "Fintech Solutions Inc", date: "Dec 12, 2023", status: "In Progress", amount: "$1,200.00" },
    { id: "ORD-8754", buyer: "Global Retail Ltd",     date: "Nov 28, 2023", status: "Completed",   amount: "$1,200.00" },
    { id: "ORD-8712", buyer: "HealthCare Plus",        date: "Nov 15, 2023", status: "Completed",   amount: "$1,200.00" },
    { id: "ORD-8690", buyer: "EduTrack Systems",       date: "Nov 02, 2023", status: "Cancelled",   amount: "$1,200.00" },
    { id: "ORD-8655", buyer: "Skyline Ventures",       date: "Oct 20, 2023", status: "Completed",   amount: "$1,200.00" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">{service.title}</h2>
              <p className="text-[11px] text-gray-400">{service.serviceId}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onArchive} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Archive</button>
              <button onClick={onDelete}  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">Delete</button>
              <button onClick={onClose}   className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={16} className="text-gray-500" /></button>
            </div>
          </div>
          <div className="flex gap-6 px-5">
            {["details", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[11px] font-semibold transition-colors capitalize ${activeTab === tab ? "border-b-2 text-amber-500" : "text-gray-400"}`}
                style={{ borderBottomColor: activeTab === tab ? GOLD : "transparent" }}
              >
                {tab === "details" ? "Service Details" : "Order History"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Featured Image */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Featured Image</h4>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center overflow-hidden">
                  {service.thumbnail
                    ? <img src={service.thumbnail} alt={service.title} className="w-full h-48 object-cover rounded-xl" />
                    : <Layers size={48} className="text-gray-300" />
                  }
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our UI/UX Brand Audit is a comprehensive evaluation of your current digital product's user interface and experience.
                  We dive deep into your design system, accessibility standards, and conversion funnels to identify friction points
                  that are costing you customers. This service includes a detailed PDF report covering 50+ heuristic data points,
                  competitive benchmarking, and a prioritized roadmap for design improvements.
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Standard Duration",  value: "5-7 Business Days" },
                  { label: "Revisions Included", value: "2 Major Rounds" },
                  { label: "Billing Model",       value: service.billingModel },
                  { label: "Deliverable Type",    value: "Figma Source + PDF Report" },
                  { label: "Industry Focus",      value: "Fintech, SaaS, E-commerce" },
                  { label: "Created On",          value: "Oct 12, 2023" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Vendor */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor Partner</h4>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{service.vendor}</p>
                    <p className="text-[10px] text-gray-500">ID: VEN-004</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Compliance Score</p>
                    <p className="font-bold text-green-600">98%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order History</h4>
                <button className="text-[10px] font-semibold text-amber-500">View All Orders</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Buyer</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="text-xs">
                        <td className="px-3 py-2 font-medium text-gray-800">{order.id}</td>
                        <td className="px-3 py-2 text-gray-600">{order.buyer}</td>
                        <td className="px-3 py-2 text-gray-500">{order.date}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                            order.status === "Completed"   ? "bg-green-50 text-green-600" :
                            order.status === "In Progress" ? "bg-blue-50 text-blue-600"  :
                            order.status === "Cancelled"   ? "bg-red-50 text-red-500"    : "bg-gray-100 text-gray-500"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//Main page
const AdminServicesManagement = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [services, setServices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRows, setSelectedRows]   = useState([]);
  const [stats, setStats] = useState({ total: "0", active: "0", flagged: "0" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setServices(mockServices);
      setStats({
        total:   mockServices.length.toString(),
        active:  mockServices.filter((s) => s.status === "Active").length.toString(),
        flagged: mockServices.filter((s) => s.status === "Flagged").length.toString(),
      });
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => { setRefreshing(true); await loadData(); };

  const handleSelectRow = (id) => setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  const handleSelectAll = (ids, checked) => setSelectedRows(checked ? ids : []);

  const handleArchive = (service) => { console.log("Archive:", service); setSelectedService(null); };
  const handleDelete  = (service) => { console.log("Delete:",  service); setSelectedService(null); };

  const handleBulkActivate = () => { console.log("Bulk activate:", selectedRows); setSelectedRows([]); };
  const handleBulkArchive  = () => { console.log("Bulk archive:",  selectedRows); setSelectedRows([]); };

  const handleBulkExport = () => {
    const selected = services.filter((s) => selectedRows.includes(s.id));
    const headers = ["Service ID", "Title", "Category", "Billing Model", "Vendor", "Status"];
    const rows = selected.map((s) =>
      [`"${s.serviceId}"`, `"${s.title}"`, `"${s.category}"`, `"${s.billingModel}"`, `"${s.vendor}"`, `"${s.status}"`].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_services.csv";
    a.click();
    URL.revokeObjectURL(url);
    setSelectedRows([]);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 max-w-7xl mx-auto space-y-5">

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Services Management</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Audit, model, and track service-based listings across all categories.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ServiceStatCard label="Total Services"   value={stats.total}   change="+12.5%" icon={Layers}      bgColor="bg-[#235E5D]" />
                <ServiceStatCard label="Active Services"  value={stats.active}  change="+4.2%"  icon={CheckCircle} bgColor="bg-[#EFB034]" />
                <ServiceStatCard label="Flagged Services" value={stats.flagged}                  icon={Flag}        bgColor="bg-red-500"   />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ServiceCategoryChart
                  categories={categories}
                  title="Services by Category"
                  subtitle="Volume distribution across primary marketplace verticals"
                />
                <ServiceStatusChart
                  statuses={serviceStatuses}
                  title="Services Status"
                  subtitle="Operational health overview"
                />
              </div>

              {/* Services Table */}
              {loading ? (
                <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
              ) : (
                <ServiceTable
                  services={services}
                  onSelect={setSelectedService}
                  selectedId={selectedService?.id}
                  selectedRows={selectedRows}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                />
              )}
            </main>

          <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. SellEasy.</div>
              <div>© 2026 Admin Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
                </span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
                <span className="cursor-pointer hover:underline">Ijoema ltd</span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {selectedService && (
        <ServiceProfile
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onArchive={() => handleArchive(selectedService)}
          onDelete={() => handleDelete(selectedService)}
        />
      )}

      <ServiceBulkActionBar
        selectedCount={selectedRows.length}
        onActivate={handleBulkActivate}
        onArchive={handleBulkArchive}
        onExport={handleBulkExport}
      />
    </div>
  );
};

export default AdminServicesManagement;