import React, { useState, useEffect, useRef } from 'react';
import VendorSidebar from '../components/VendorSidebar';
import { useVendor } from '../context/useVendor';
import Navbar3 from '../components/adminDashboard/Navbar4';
import Footer from "../components/Vendormanagement/VendorFooter";
import ProductListing from '../components/ProductListing';
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  X, Trash2, CreditCard, Box, ListChecks,
  Edit, ChevronDown, ChevronUp,
} from 'lucide-react';

import {
  getProducts,
  createProductListing,
  updateProductListing,
  deleteProductListing,
  uploadListingImages,
} from '../services/authService';

// ─── Constants ────────────────────────────────────────────────────────────────
const QUALITY_OPTIONS = ['High', 'Medium', 'Low'];

const getQualityStyle = (quality) => {
  const q = (quality || '').toLowerCase();
  if (q === 'high') return { bg: '#FFF8E7', text: '#B8860B', border: '#F5B841' };
  if (q === 'low')  return { bg: '#FFF3E0', text: '#C07000', border: '#E09030' };
  return              { bg: '#FFFBF0', text: '#A07800', border: '#F5C842' };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
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
const ProductCard = ({ product, currencySymbol, onClick, onEdit, onDelete }) => {
  const qStyle = getQualityStyle(product.inventory_quality || product.qty);
  const mainImage = product.images?.[0]?.image || null;
  const variantCount = product.variants?.length || 0;
  const hasMultipleVariants = variantCount > 1;
  const [showVariants, setShowVariants] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
      <div className="relative h-40 bg-slate-50 cursor-pointer" onClick={onClick}>
        {mainImage ? (
          <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-slate-200" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${product.is_published === true ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {product.is_published === true ? 'LIVE' : 'DRAFT'}
          </span>
        </div>
        {/* Action Icons Overlay */}
        <div className="absolute top-2 left-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-black hover:bg-gray-100 shadow-sm transition-colors"
            title="Edit Product"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product); }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-black hover:bg-gray-100 shadow-sm transition-colors"
            title="Delete Product"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-[9px] font-bold uppercase text-slate-400">{product.category || '—'}</p>
        <p className="text-[13px] font-bold text-slate-800 truncate">{product.title}</p>

        {product.sku && (
          <p className="text-[9px] text-slate-500 font-mono">SKU: {product.sku}</p>
        )}

        <div className="flex items-center justify-between pt-0.5">
          <p className="text-[13px] font-black text-[#125852]">{currencySymbol} {Number(product.price || 0).toLocaleString()}</p>
          <span
            className="text-[8px] font-black px-2 py-0.5 rounded-full border"
            style={{ background: qStyle.bg, color: qStyle.text, borderColor: qStyle.border }}
          >
            {(product.inventory_quality || product.qty || 'Medium').toUpperCase()}
          </span>
        </div>

        {hasMultipleVariants && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowVariants(!showVariants); }}
            className="w-full mt-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
          >
            {showVariants ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {showVariants ? 'Hide' : 'View'} {variantCount} variants
          </button>
        )}

        {showVariants && hasMultipleVariants && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {product.variants?.map((variant, idx) => (
              <div key={variant.id || idx} className="bg-slate-50 rounded-lg p-2 text-[9px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">
                    {variant.size && `Size: ${variant.size}`} {variant.color && `• ${variant.color}`}
                  </span>
                  <span className="font-bold text-[#125852]">
                    {currencySymbol} {Number(variant.price || product.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-500">SKU: {variant.sku || product.sku}</span>
                  <span className="text-slate-500">Stock: {variant.stock || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── List View Item ───────────────────────────────────────────────────────────
const ProductListItem = ({ product, currencySymbol, onEdit, onDelete }) => {
  const qStyle = getQualityStyle(product.inventory_quality || product.qty);
  const mainImage = product.images?.[0]?.image || null;
  const variantCount = product.variants?.length || 0;
  const [showVariants, setShowVariants] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0">
          {mainImage ? (
            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-slate-200" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{product.category || '—'}</p>
              <h3 className="text-sm font-bold text-slate-800 truncate">{product.title}</h3>
              {product.sku && (
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${product.is_published === true ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {product.is_published === true ? 'LIVE' : 'DRAFT'}
              </span>
              {variantCount > 1 && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                  {variantCount} variants
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm font-black text-[#125852]">{currencySymbol} {Number(product.price || 0).toLocaleString()}</p>
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full border"
              style={{ background: qStyle.bg, color: qStyle.text, borderColor: qStyle.border }}
            >
              {(product.inventory_quality || product.qty || 'Medium').toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-500">Stock: {product.stock || 0}</span>
          </div>

          {variantCount > 1 && (
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="mt-2 px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              {showVariants ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {showVariants ? 'Hide' : 'View'} {variantCount} variants
            </button>
          )}

          {showVariants && variantCount > 1 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {product.variants?.map((variant, idx) => (
                <div key={variant.id || idx} className="bg-slate-50 rounded-lg p-3 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">
                      {variant.size && `Size: ${variant.size}`} {variant.color && `• ${variant.color}`}
                    </span>
                    <span className="font-bold text-[#125852]">
                      {currencySymbol} {Number(variant.price || product.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-500">SKU: {variant.sku || product.sku}</span>
                    <span className="text-slate-500">Stock: {variant.stock || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-slate-100 text-black rounded-lg hover:bg-slate-200 transition-colors"
            title="Edit Product"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 bg-slate-100 text-black rounded-lg hover:bg-slate-200 transition-colors"
            title="Delete Product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDashboard = () => {
  // Get vendor data from context
  const { vendorType, businessCategory, vendorCountry, currencySymbol } = useVendor();

  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [qualityOptions, setQualityOptions] = useState(QUALITY_OPTIONS);
  const filterRef = useRef(null);

  // Load products
  useEffect(() => { 
    loadProducts(); 
  }, []);

  // Handle click outside filter
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
      console.log('[loadProducts] raw:', data);
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

  // ── Create ──────────────────────────────────────────────────────────────────
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

  // ── Update ──────────────────────────────────────────────────────────────────
  const handleUpdateProduct = async (productId, payload, imageFiles) => {
    setIsLoading(true);
    try {
      console.log('[handleUpdateProduct] Updating listing ID:', productId);

      await updateProductListing(productId, {
        title: payload.title,
        description: payload.description || '',
        location: payload.location || '',
        price: payload.price,
        sku: payload.sku || '',
        qty: payload.qty,
        stock: Number(payload.stock) || 0,
        sizes: payload.sizes || [],
        colors: payload.colors || [],
        is_published: payload.is_published === true,
        category: payload.category || '',
        business_category: businessCategory,
      });

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

  // ── Edit handler ────────────────────────────────────────────────────────────
  const handleEditProduct = (product) => {
    console.log('[handleEditProduct] product:', product);
    console.log('[handleEditProduct] listing ID:', product.id);

    const normalizedQty =
      product.inventory_quality ||
      product.qty ||
      qualityOptions[1] ||
      'Medium';

    setSelectedProduct({
      id: product.id,
      title: product.title || '',
      category: product.category || '',
      price: product.price ? String(product.price) : '',
      sku: product.sku || '',
      qty: normalizedQty,
      location: product.vendor_location || product.location || '',
      description: product.description || '',
      stock: product.detail?.stock ?? product.stock ?? 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_published: product.is_published === true || product.status === 'published',
      images: product.images || [],
      variants: product.variants || [],
    });
    setIsEditModalOpen(true);
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDeleteProduct = (product) => {
    console.log('[handleDeleteProduct] product:', product);
    console.log('[handleDeleteProduct] listing ID:', product.id);
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // ── Confirm Delete ──────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!selectedProduct?.id) {
      console.error('[confirmDelete] No product ID found:', selectedProduct);
      setIsDeleteModalOpen(false);
      return;
    }

    console.log('[confirmDelete] Deleting listing ID:', selectedProduct.id);

    setIsDeleteModalOpen(false);
    setIsLoading(true);
    try {
      await deleteProductListing(selectedProduct.id);
      await loadProducts();
      setSelectedProduct(null);
      showSuccess('Product deleted successfully.');
    } catch (err) {
      console.error('Failed to delete product', err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete product. Please try again.';
      showSuccess(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      !filterStatus ||
      (filterStatus === 'published' && p.is_published === true) ||
      (filterStatus === 'draft' && p.is_published !== true);
    const rawQty = (p.inventory_quality || p.qty || '').toUpperCase();
    const matchesQuality = !filterQuality || rawQty === filterQuality.toUpperCase();
    return matchesSearch && matchesStatus && matchesQuality;
  });

  const activeFilterCount = [filterStatus, filterQuality].filter(Boolean).length;
  const clearFilters = () => { setFilterStatus(''); setFilterQuality(''); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#ecece7] text-slate-800 p-3 gap-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <VendorSidebar activePage="products" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {/* Success toast */}
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
            <StatCard title="High Quality" number={products.filter((p) => (p.inventory_quality || p.qty || '').toUpperCase() === 'HIGH').length} icon={Box} iconBgColor="bg-orange-50" iconColor="text-orange-600" />
            <StatCard title="Drafts" number={products.filter((p) => p.is_published !== true).length} icon={CreditCard} iconBgColor="bg-indigo-50" iconColor="text-indigo-600" />
          </div>

          {/* Search + Filter + View toggle */}
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className={`relative w-80 flex items-center border rounded-lg shadow-sm transition-all bg-white ${searchFocused ? 'border-[#F5B841] ring-1 ring-[#F5B841]' : 'border-slate-200'}`}>
              <Search className={`absolute left-3 transition-colors ${searchFocused ? 'text-[#F5B841]' : 'text-slate-400'}`} size={16} />
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
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Filter dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${activeFilterCount > 0 ? 'bg-[#F5B841] text-white border-[#F5B841] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#F5B841]'}`}
                >
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-white text-[#F5B841] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-64">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Filter Products</h3>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-[10px] font-bold text-[#F5B841] hover:underline">Clear all</button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Status</label>
                      <div className="flex gap-2 flex-wrap">
                        {['', 'published', 'draft'].map((s) => (
                          <button key={s} type="button" onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterStatus === s ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852]'}`}>
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Quality</label>
                      <div className="flex gap-2 flex-wrap">
                        {['', ...qualityOptions].map((q) => (
                          <button key={q} type="button" onClick={() => setFilterQuality(q)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterQuality === q ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852]'}`}>
                            {q === '' ? 'All' : q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                      Showing {filteredProducts.length} of {products.length} products
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-200 mx-1" />

              {/* View toggle */}
              <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-slate-100' : ''}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-slate-100' : ''}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active:</span>
              {filterStatus && <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">{filterStatus} <button onClick={() => setFilterStatus('')}><X size={9} /></button></span>}
              {filterQuality && <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">{filterQuality} <button onClick={() => setFilterQuality('')}><X size={9} /></button></span>}
            </div>
          )}

          {/* Product grid / list / empty / loading */}
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
                {activeFilterCount > 0 || searchQuery ? 'No matching products' : 'No products found'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {activeFilterCount > 0 || searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'Start by adding your first product to the catalog.'}
              </p>
              {!activeFilterCount && !searchQuery && (
                <button onClick={() => setIsProductModalOpen(true)} className="bg-[#F5B841] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-[#E0A83B]">
                  <Plus size={16} /> Add Your First Product
                </button>
              )}
            </div>
          ) : viewType === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onClick={() => {}}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Create Product Modal */}
      <ProductListing
        key="create-product-modal"
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={isLoading}
        isServiceVendor={false}
        businessCategory={businessCategory}
        currencySymbol={currencySymbol}
        qualityOptions={qualityOptions}
        submitLabel="Publish Product"
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <ProductListing
          key={`edit-${selectedProduct.id}`}
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
          qualityOptions={qualityOptions}
          submitLabel="Save Changes"
        />
      )}

      {/* Delete Confirm Modal */}
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
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;



