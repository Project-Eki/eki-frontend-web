import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import Footer from "../components/Vendormanagement/VendorFooter";
import ProductListing from '../components/ProductListing'; // Import the shared component
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  X, Trash2, CreditCard, Box, ListChecks,
} from 'lucide-react';

import {
  getProducts,
  createProductListing,
  updateProductListing,
  deleteProductListing,
  uploadListingImages,
  deleteListingImage,
  getVendorDashboard,
} from '../services/authService';

// ─── Constants ────────────────────────────────────────────────────────────────
const getCurrencySymbol = (country) => {
  const map = {
    uganda: 'UGX', nigeria: '₦', kenya: 'KES', ghana: '₵',
    'south africa': 'R', tanzania: 'TZS', rwanda: 'RWF',
    ethiopia: 'ETB', zambia: 'ZMW', egypt: 'EGP', morocco: 'MAD',
    senegal: 'CFA', cameroon: 'CFA', ivory: 'CFA', "côte d'ivoire": 'CFA',
    angola: 'AOA', mozambique: 'MZN', zimbabwe: 'ZWL', botswana: 'BWP',
    namibia: 'NAD', malawi: 'MWK', sudan: 'SDG', tunisia: 'TND',
    libya: 'LYD', algeria: 'DZD', madagascar: 'MGA', somalia: 'SOS',
    usa: '$', 'united states': '$', canada: 'CA$', mexico: 'MX$',
    brazil: 'R$', argentina: '$', colombia: '$', chile: 'CLP',
    peru: 'S/', venezuela: 'Bs', uruguay: '$U', ecuador: '$',
    uk: '£', 'united kingdom': '£', germany: '€', france: '€',
    italy: '€', spain: '€', portugal: '€', netherlands: '€',
    belgium: '€', austria: '€', switzerland: 'CHF', sweden: 'kr',
    norway: 'kr', denmark: 'kr', finland: '€', poland: 'zł',
    czechia: 'Kč', hungary: 'Ft', romania: 'lei', bulgaria: 'лв',
    russia: '₽', ukraine: '₴', turkey: '₺',
    china: '¥', japan: '¥', india: '₹', 'south korea': '₩',
    indonesia: 'Rp', malaysia: 'RM', thailand: '฿', singapore: 'S$',
    philippines: '₱', vietnam: '₫', bangladesh: '৳', pakistan: '₨',
    'sri lanka': '₨', nepal: '₨', myanmar: 'K', cambodia: '₭',
    'saudi arabia': 'SR', uae: 'AED', 'united arab emirates': 'AED',
    qatar: 'QR', kuwait: 'KD', bahrain: 'BD', jordan: 'JD',
    israel: '₪', iran: '﷼', iraq: 'IQD',
    australia: 'A$', 'new zealand': 'NZ$',
  };
  return map[country?.toLowerCase()] || '$';
};

const QTY_DISPLAY = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
const CATEGORIES = [
  'Electronics', 'Computers', 'Grocery', 'Home & Decor',
  'Fashion', 'Retail', 'Beauty', 'Others',
];

const getQualityStyle = (qty) => {
  const q = (qty || '').toLowerCase();
  if (q === 'high')   return { bg: '#FFF8E7', text: '#B8860B', border: '#F5B841' };
  if (q === 'low')    return { bg: '#FFF3E0', text: '#C07000', border: '#E09030' };
  return               { bg: '#FFFBF0', text: '#A07800', border: '#F5C842' };
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ title, number, icon: Icon, iconBgColor, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{number}</p>
      </div>
      <div className={`${iconBgColor} p-2.5 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

// ─── ProductCard ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, currencySymbol, onClick }) => {
  const qStyle = getQualityStyle(product.inventory_quality || product.qty);
  const mainImage = product.images?.[0]?.image || null;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="relative h-40 bg-slate-50">
        {mainImage ? (
          <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-slate-200" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${product.is_published === true ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {product.is_published === true ? 'LIVE' : 'DRAFT'}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-[9px] font-bold uppercase text-slate-400">{product.category || '—'}</p>
        <p className="text-[13px] font-bold text-slate-800 truncate">{product.title}</p>
        <div className="flex items-center justify-between pt-0.5">
          <p className="text-[13px] font-black text-[#125852]">{currencySymbol} {Number(product.price || 0).toLocaleString()}</p>
          <span
            className="text-[8px] font-black px-2 py-0.5 rounded-full border"
            style={{ background: qStyle.bg, color: qStyle.text, borderColor: qStyle.border }}
          >
            {(product.inventory_quality || product.qty || 'Medium').toUpperCase()}
          </span>
        </div>
        {product.sku && <p className="text-[9px] text-slate-400 font-mono truncate">{product.sku}</p>}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDashboard = () => {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [vendorCountry, setVendorCountry] = useState('');
  const [businessCategory, setBusinessCategory] = useState('retail');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const filterRef = useRef(null);
  const [vendorType, setVendorType] = useState("product");

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const data = await getVendorDashboard();
        if (data?.country) {
          setVendorCountry(data.country);
          setCurrencySymbol(getCurrencySymbol(data.country));
        }
        if (data?.businessCategory) {
          setBusinessCategory(data.businessCategory);
        }
        const serviceCategories = [
          "beauty", "transport", "tailoring", "airlines", "hotels", "other",
        ];
        const bc = data?.businessCategory || "retail";
        const vType = serviceCategories.includes(bc) ? "service" : "product";
        setVendorType(vType);
      } catch (err) {
        console.error("Failed to load vendor info", err);
      }
    };
    loadVendorData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProducts = async () => {
    setIsFetching(true);
    try { 
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) { 
      console.error('Failed to load products', err); 
    } finally { 
      setIsFetching(false); 
    }
  };

  const showSuccess = (msg) => { 
    setSuccessMsg(msg); 
    setTimeout(() => setSuccessMsg(''), 4000); 
  };

  // Handle product creation
  const handleCreateProduct = async (payload, imageFiles) => {
    setIsLoading(true);
    try {
      const created = await createProductListing({
        ...payload,
        business_category: businessCategory,
      });
      if (imageFiles.length > 0 && created?.id) {
        await uploadListingImages(created.id, imageFiles);
      }
      await loadProducts();
      setIsProductModalOpen(false);
      showSuccess('Product created successfully!');
    } catch (err) {
      console.error('Failed to create product', err);
      const detail = err.response?.data?.errors ?? err.response?.data;
      const msg = detail && typeof detail === 'object'
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to create product. Please try again.';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product update
  const handleUpdateProduct = async (productId, payload, imageFiles) => {
    setIsLoading(true);
    try {
      await updateProductListing(productId, {
        title: payload.title,
        price: payload.price,
        sku: payload.sku,
        qty: payload.qty,
        stock: Number(payload.stock) || 0,
        location: payload.location,
        description: payload.description,
        is_published: payload.is_published,
        sizes: payload.sizes || [],
        colors: payload.colors || [],
      });
      
      // Handle image deletions if needed (you may need to track which images were deleted)
      if (imageFiles.length > 0) {
        await uploadListingImages(productId, imageFiles);
      }
      
      await loadProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      showSuccess('Product updated successfully!');
    } catch (err) {
      console.error('Failed to update product', err);
      const detail = err.response?.data?.errors ?? err.response?.data;
      const msg = detail && typeof detail === 'object'
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to update product.';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct({
      id: product.id,
      title: product.title || '',
      category: product.category || '',
      price: product.price || '',
      sku: product.sku || '',
      qty: QTY_DISPLAY[product.inventory_quality] || product.qty || 'Medium',
      location: product.vendor_location || product.location || '',
      description: product.description || '',
      stock: product.detail?.stock ?? product.stock ?? 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_published: product.is_published === true || product.status === 'published',
      images: product.images || [],
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = () => { 
    if (!selectedProduct?.id) return; 
    setIsDeleteModalOpen(true); 
  };
  
  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsLoading(true);
    try {
      await deleteProductListing(selectedProduct.id);
      await loadProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      showSuccess('Product deleted.');
    } catch (err) {
      console.error('Failed to delete product', err);
    } finally { 
      setIsLoading(false); 
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesStatus = !filterStatus || (filterStatus === 'published' && p.is_published === true) || (filterStatus === 'draft' && p.is_published !== true);
    const rawQty = (p.inventory_quality || p.qty || '').toUpperCase();
    const matchesQuality = !filterQuality || rawQty === filterQuality.toUpperCase();
    return matchesSearch && matchesCategory && matchesStatus && matchesQuality;
  });

  const activeFilterCount = [filterCategory, filterStatus, filterQuality].filter(Boolean).length;
  const clearFilters = () => { 
    setFilterCategory(''); 
    setFilterStatus(''); 
    setFilterQuality(''); 
  };

  return (
    <div className="flex min-h-screen bg-[#ecece7] text-slate-800 p-3 gap-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <VendorSidebar activePage="products" vendorType={vendorType} businessCategory={businessCategory} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 size={12} /> {successMsg}
          </div>
        )}

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Product Management</h1>
              <p className="text-slate-400 text-[11px]">
                Manage your inventory, pricing, and visibility across the marketplace.
                {vendorCountry && (
                  <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500 text-[9px]">
                    {vendorCountry} · {currencySymbol}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#F5B841] text-white px-5 py-2.5 rounded-lg text-[12px] font-bold flex items-center gap-2 hover:bg-[#E0A83B] transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} /> Add New Product
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <StatCard title="Total Products" number={products.length} icon={Package} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard title="Active Listings" number={products.filter((p) => p.is_published === true).length} icon={ListChecks} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
            <StatCard title="High Quality" number={products.filter((p) => (p.inventory_quality || p.qty || "").toUpperCase() === "HIGH").length} icon={Box} iconBgColor="bg-orange-50" iconColor="text-orange-600" />
            <StatCard title="Drafts" number={products.filter((p) => p.is_published !== true).length} icon={CreditCard} iconBgColor="bg-indigo-50" iconColor="text-indigo-600" />
          </div>

          {/* Search + Filter + View toggle */}
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className={`relative w-80 flex items-center border rounded-lg shadow-sm transition-all bg-white ${searchFocused ? "border-[#F5B841] ring-1 ring-[#F5B841]" : "border-slate-200"}`}>
              <Search className={`absolute left-3 transition-colors ${searchFocused ? "text-[#F5B841]" : "text-slate-400"}`} size={16} />
              <input
                type="text"
                placeholder="Search by title or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none rounded-lg"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${activeFilterCount > 0 ? "bg-[#F5B841] text-white border-[#F5B841] shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#F5B841]"}`}
                >
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-white text-[#F5B841] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-72">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Filter Products</h3>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-[10px] font-bold text-[#F5B841] hover:underline">Clear all</button>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Status</label>
                      <div className="flex gap-2 flex-wrap">
                        {["", "published", "draft"].map((s) => (
                          <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterStatus === s ? "bg-[#125852] text-white border-[#125852]" : "bg-white text-slate-500 border-slate-200 hover:border-[#125852]"}`}>
                            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Quality</label>
                      <div className="flex gap-2 flex-wrap">
                        {["", "High", "Medium", "Low"].map((q) => (
                          <button key={q} type="button" onClick={() => setFilterQuality(q)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterQuality === q ? "bg-[#125852] text-white border-[#125852]" : "bg-white text-slate-500 border-slate-200 hover:border-[#125852]"}`}>
                            {q === "" ? "All" : q}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Category</label>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] bg-white outline-none focus:border-[#125852]">
                        <option value="">All Categories</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                      Showing {filteredProducts.length} of {products.length} products
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-200 mx-1" />
              <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setViewType("grid")} className={`p-1.5 rounded ${viewType === "grid" ? "bg-slate-100" : ""}`}>
                  <LayoutGrid size={16} />
                </button>
                <button onClick={() => setViewType("list")} className={`p-1.5 rounded ${viewType === "list" ? "bg-slate-100" : ""}`}>
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active:</span>
              {filterStatus && (
                <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {filterStatus}
                  <button onClick={() => setFilterStatus("")}><X size={9} /></button>
                </span>
              )}
              {filterQuality && (
                <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {filterQuality}
                  <button onClick={() => setFilterQuality("")}><X size={9} /></button>
                </span>
              )}
              {filterCategory && (
                <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {filterCategory}
                  <button onClick={() => setFilterCategory("")}><X size={9} /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-40 bg-slate-100" />
                  <div className="p-4 space-y-1.5">
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <ShoppingBag className="text-slate-200 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800">
                {activeFilterCount > 0 || searchQuery ? "No matching products" : "No products found"}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {activeFilterCount > 0 || searchQuery ? "Try adjusting your search or filters." : "Start by adding your first product to the catalog."}
              </p>
              {!activeFilterCount && !searchQuery && (
                <button onClick={() => setIsProductModalOpen(true)} className="bg-[#F5B841] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-[#E0A83B]">
                  <Plus size={16} /> Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className={viewType === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} onClick={() => handleProductClick(product)} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Create Product Modal - Using Shared Component */}
      <ProductListing
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={isLoading}
        isServiceVendor={false}
        businessCategory={businessCategory}
        currencySymbol={currencySymbol}
        submitLabel="Publish Product"
      />

      {/* Edit Product Modal - Using Shared Component with initialData */}
      <ProductListing
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={async (payload, imageFiles) => {
          await handleUpdateProduct(selectedProduct.id, payload, imageFiles);
        }}
        isLoading={isLoading}
        isServiceVendor={false}
        businessCategory={businessCategory}
        currencySymbol={currencySymbol}
        initialData={selectedProduct}
        submitLabel="Save Changes"
      />

      {/* DELETE CONFIRM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Delete Product?</h3>
            <p className="text-[11px] text-slate-500 mb-5">
              "<span className="font-bold text-slate-700">{selectedProduct?.title}</span>" will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;