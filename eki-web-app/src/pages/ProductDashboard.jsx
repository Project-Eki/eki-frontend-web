import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar3 from '../components/adminDashboard/Navbar3';
// import logo from '../assets/logo.jpeg';
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  LayoutDashboard, Truck, CreditCard, MessageSquare, Settings, LogOut,
  X, Upload, Trash2, Pencil, Palette, Ruler,
} from 'lucide-react';
import {
  getProducts,
  createProductListing,
  updateProductListing,
  deleteProductListing,
  uploadListingImage,
  getVendorDashboard,
  SignoutUser,
} from '../services/authService';


// SIZE_OPTIONS 
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'one_size'];
const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Purple', 'Pink', 'Brown', 'Grey', 'Navy',
  'Beige', 'Maroon', 'Teal', 'Gold', 'Silver',
];

const getCurrencySymbol = (country) => {
  const map = {
    uganda: 'UGX', nigeria: '₦', kenya: 'KES', ghana: 'GHS',
    'south africa': 'ZAR', usa: '$', 'united states': '$',
    uk: '£', 'united kingdom': '£', tanzania: 'TZS', rwanda: 'RWF',
    ethiopia: 'ETB', zambia: 'ZMW',
  };
  return map[country?.toLowerCase()] || '$';
};

const QTY_DISPLAY = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

const CATEGORIES = [
  'Electronics', 'Computers', 'Grocery', 'Home & Decor',
  'Fashion', 'Retail', 'Beauty', 'Others',
];

const blankForm = () => ({
  title: '', category: '', price: '', sku: '', qty: 'Medium',
  location: '', description: '', image: null, imageFile: null,
  sizes: [],
  colors: [],
});

// ─── Main Component ──
const ProductDashboard = () => {
  const [viewType, setViewType]                     = useState('grid');
  const [products, setProducts]                     = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]       = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen]   = useState(false);
  const [selectedProduct, setSelectedProduct]       = useState(null);
  const [isPublished, setIsPublished]               = useState(true);
  const [isLoading, setIsLoading]                   = useState(false);
  const [isFetching, setIsFetching]                 = useState(true);
  const [currencySymbol, setCurrencySymbol]         = useState('$');
  const [vendorCountry, setVendorCountry]           = useState('');
  const [businessCategory, setBusinessCategory]     = useState('retail');
  const [searchQuery, setSearchQuery]               = useState('');
  const [successMsg, setSuccessMsg]                 = useState('');
  const fileInputRef     = useRef(null);
  const editFileInputRef = useRef(null);

  const [formData, setFormData]     = useState(blankForm());
  const [errors, setErrors]         = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    loadProducts();
    loadVendorInfo();
  }, []);

  const loadVendorInfo = async () => {
    try {
      const data = await getVendorDashboard();
      if (data?.country) {
        setVendorCountry(data.country);
        setCurrencySymbol(getCurrencySymbol(data.country));
      }
      if (data?.businessCategory) {
        setBusinessCategory(data.businessCategory);
      }
    } catch (err) {
      console.error('Failed to load vendor info', err);
    }
  };

  const loadProducts = async () => {
    setIsFetching(true);
    try {
      const list = await getProducts();
      setProducts(list);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, image: reader.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setSelectedProduct((prev) => ({ ...prev, image: reader.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const toggleChip = (field, value, isEdit = false) => {
    if (isEdit) {
      setSelectedProduct((prev) => {
        const arr = prev[field] || [];
        return {
          ...prev,
          [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        };
      });
    } else {
      setFormData((prev) => {
        const arr = prev[field] || [];
        return {
          ...prev,
          [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        };
      });
    }
  };

  const validateForm = (data) => {
    const errs = {};
    if (!data.title?.trim()) errs.title = 'Title is required';
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0)
      errs.price = 'Valid price is required';
    return errs;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsLoading(true);
    try {
      const created = await createProductListing({
        title:             formData.title,
        description:       formData.description,
        location:          formData.location,
        price:             formData.price,
        sku:               formData.sku,
        qty:               formData.qty,
        sizes:             formData.sizes,
        colors:            formData.colors,
        is_published:      isPublished,
        business_category: businessCategory,
      });

      if (formData.imageFile && created?.id) {
        try { await uploadListingImage(created.id, formData.imageFile); }
        catch (imgErr) { console.warn('Image upload failed, product still created', imgErr); }
      }

      await loadProducts();
      setIsProductModalOpen(false);
      setFormData(blankForm());
      setErrors({});
      setIsPublished(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showSuccess('Product created successfully!');
    } catch (err) {
      console.error('Failed to create product', err);
      const detail = err.response?.data?.errors ?? err.response?.data;
      const msg = detail && typeof detail === 'object'
        ? Object.entries(detail)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ')
        : 'Failed to create product. Please try again.';
      setErrors({ _server: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    const parseSaved = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return val.split(',').map((s) => s.trim()).filter(Boolean); }
    };

    setSelectedProduct({
      ...product,
      qty:      QTY_DISPLAY[product.inventory_quality] || product.qty || 'Medium',
      location: product.vendor_location || product.location || '',
      imageFile: null,
      sizes:  parseSaved(product.sizes  || product.size_variants),
      colors: parseSaved(product.colors || product.color_variants),
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct?.id) return;

    const validationErrors = validateForm(selectedProduct);
    if (Object.keys(validationErrors).length > 0) { setEditErrors(validationErrors); return; }

    setIsLoading(true);
    try {
      await updateProductListing(selectedProduct.id, {
        title:        selectedProduct.title,
        price:        selectedProduct.price,
        sku:          selectedProduct.sku,
        qty:          selectedProduct.qty,
        location:     selectedProduct.location,
        description:  selectedProduct.description,
        is_published: selectedProduct.is_published ?? true,
        sizes:        selectedProduct.sizes  || [],
        colors:       selectedProduct.colors || [],
      });

      if (selectedProduct.imageFile) {
        try { await uploadListingImage(selectedProduct.id, selectedProduct.imageFile); }
        catch (imgErr) { console.warn('Image upload failed during update', imgErr); }
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
      setEditErrors({ _server: msg });
    } finally {
      setIsLoading(false);
    }
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
      setEditErrors({ _server: 'Failed to delete product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const VariantSection = ({ sizes, colors, isEdit = false }) => (
    <div className="space-y-5 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
      <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Product Variants</h4>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Ruler size={14} className="text-slate-400" />
          <label className="text-[11px] font-bold uppercase text-slate-500">Available Sizes</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleChip('sizes', size, isEdit)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                sizes.includes(size)
                  ? 'bg-[#125852] text-white border-[#125852]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852] hover:text-[#125852]'
              }`}
            >
              {size === 'one_size' ? 'One Size' : size}
            </button>
          ))}
        </div>
        {sizes.length > 0 && (
          <p className="text-[10px] text-[#125852] font-medium">Selected: {sizes.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-slate-400" />
          <label className="text-[11px] font-bold uppercase text-slate-500">Available Colors</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleChip('colors', color, isEdit)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                colors.includes(color)
                  ? 'bg-[#125852] text-white border-[#125852]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852] hover:text-[#125852]'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
        {colors.length > 0 && (
          <p className="text-[10px] text-[#125852] font-medium">Selected: {colors.join(', ')}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 mb-4">
          {/* <img src={logo} alt="Eki" className="h-8 w-auto object-contain" /> */}
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink to="/vendordashboard"         icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink to="/product-dashboard" icon={<ShoppingBag size={18} />}     label="Products" active />
          <SidebarLink to="/service"           icon={<Plus size={18} />}             label="Services" />
          <SidebarLink to="/order-management"  icon={<Truck size={18} />}            label="Orders" />
          <SidebarLink to="/payment"           icon={<CreditCard size={18} />}       label="Payments" />
          <SidebarLink to="/reviews"           icon={<MessageSquare size={18} />}    label="Reviews" />
        </nav>
        <div className="p-4 border-t border-slate-50 mt-auto">
          <SidebarLink to="/settings" icon={<Settings size={18} />} label="Store Settings" />
          <Link
            to="/"
            onClick={SignoutUser}
            className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-bold mt-2"
          >
            <LogOut size={18} /><span>Log out</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {/* Success toast */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <main className="p-8 max-w-[1400px] mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Product Management</h1>
              <p className="text-slate-400 text-[12px]">
                Manage your inventory, pricing, and visibility across the marketplace.
                {vendorCountry && (
                  <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                    {vendorCountry} · {currencySymbol}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#125852] text-white px-5 py-2.5 rounded-lg text-[12px] font-bold flex items-center gap-2 hover:bg-[#0e443f] transition-all active:scale-95"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Products"  value={products.length}
              icon={<Package className="text-teal-600" />} />
            <StatCard label="Active Listings" value={products.filter((p) => p.is_published).length}
              icon={<CheckCircle2 className="text-teal-600" />} />
            <StatCard
              label="High Quality"
              value={products.filter((p) => (p.inventory_quality || p.qty || '').toUpperCase() === 'HIGH').length}
              icon={<CheckCircle2 className="text-green-500" />}
            />
            <StatCard label="Drafts" value={products.filter((p) => !p.is_published).length}
              icon={<Package className="text-slate-400" />} />
          </div>

          {/* Search + View toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-80">
              <input
                type="text" placeholder="Search by title or SKU..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#125852] shadow-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Filter size={14} /> Filters
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-1" />
              <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-slate-100' : ''}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-slate-100' : ''}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Product grid / loading / empty */}
          {isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-100" />
                  <div className="p-5 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <ShoppingBag className="text-slate-200 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-slate-500 text-sm mb-6">Start by adding your first product to the catalog.</p>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-[#125852] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-[#0e443f]"
              >
                <Plus size={16} /> Add Your First Product
              </button>
            </div>
          ) : (
            <div className={viewType === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] text-left"
          >
            <div className="px-6 py-5 border-b flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Create New Product</h2>
                <p className="text-[11px] text-slate-500">
                  Category: <span className="font-bold text-[#125852] capitalize">{businessCategory}</span>
                </p>
              </div>
              <button type="button" onClick={() => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">

              {errors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-4 py-3 rounded-lg">
                  {errors._server}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. Premium Wireless Headphones"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.title && <p className="text-red-500 text-[10px] font-bold">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleInputChange}
                  rows="3" placeholder="Describe your product..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Location</label>
                <input
                  type="text" name="location" value={formData.location} onChange={handleInputChange}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Sub-category</label>
                  <select
                    name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input
                    type="number" name="price" value={formData.price} onChange={handleInputChange}
                    placeholder="0.00" min="0" step="any"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {errors.price && <p className="text-red-500 text-[10px] font-bold">{errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                  <input
                    type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                    placeholder="PRD-XXXX"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Quality</label>
                  <select
                    name="qty" value={formData.qty} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <VariantSection sizes={formData.sizes} colors={formData.colors} isEdit={false} />

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500">Product Image</label>
                <div className="flex gap-3 items-center">
                  {formData.image && (
                    <div className="w-20 h-20 rounded-lg border overflow-hidden relative group">
                      <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({ ...p, image: null, imageFile: null }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors"
                  >
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1">UPLOAD</span>
                  </div>
                  <input
                    type="file" ref={fileInputRef} onChange={handleFileChange}
                    className="hidden" accept="image/jpeg,image/png,image/webp"
                  />
                </div>
                <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[12px] font-bold text-slate-800 uppercase">Publish immediately</p>
                  <p className="text-[10px] text-slate-400">Off = saved as draft.</p>
                </div>
                <div
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isPublished ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t flex justify-end gap-3 bg-slate-50/20">
              <button
                type="button"
                onClick={() => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); }}
                className="px-8 py-2.5 text-[11px] font-bold border rounded-lg bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isLoading}
                className="px-8 py-2.5 bg-[#F5B841] text-white rounded-lg text-[11px] font-bold uppercase shadow-sm disabled:opacity-60 hover:bg-[#E0A83B] active:scale-95 transition-all"
              >
                {isLoading ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT / DELETE MODAL */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpdate}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] text-left"
          >
            <div className="px-6 py-5 border-b flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Edit Product</h2>
                <p className="text-[11px] text-slate-500">Update the details for this product listing.</p>
              </div>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); setEditErrors({}); }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">

              {editErrors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-4 py-3 rounded-lg">
                  {editErrors._server}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input
                  type="text" value={selectedProduct.title || ''}
                  onChange={(e) => setSelectedProduct((p) => ({ ...p, title: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {editErrors.title && <p className="text-red-500 text-[10px] font-bold">{editErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  value={selectedProduct.description || ''}
                  onChange={(e) => setSelectedProduct((p) => ({ ...p, description: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Location</label>
                <input
                  type="text" value={selectedProduct.location || ''}
                  onChange={(e) => setSelectedProduct((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Sub-category</label>
                  <select
                    value={selectedProduct.category || ''}
                    onChange={(e) => setSelectedProduct((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input
                    type="number" value={selectedProduct.price || ''}
                    onChange={(e) => setSelectedProduct((p) => ({ ...p, price: e.target.value }))}
                    min="0" step="any" placeholder="0.00"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {editErrors.price && <p className="text-red-500 text-[10px] font-bold">{editErrors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                  <input
                    type="text" value={selectedProduct.sku || ''}
                    onChange={(e) => setSelectedProduct((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="PRD-XXXX"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Quality</label>
                  <select
                    value={selectedProduct.qty || 'Medium'}
                    onChange={(e) => setSelectedProduct((p) => ({ ...p, qty: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <VariantSection
                sizes={selectedProduct.sizes   || []}
                colors={selectedProduct.colors || []}
                isEdit={true}
              />

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500">Product Image</label>
                <div className="flex gap-3 items-center">
                  {(selectedProduct.image || selectedProduct.image_url) && (
                    <div className="w-20 h-20 rounded-lg border overflow-hidden relative group">
                      <img
                        src={selectedProduct.image || selectedProduct.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedProduct((p) => ({ ...p, image: null, image_url: null }))}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors"
                  >
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1">CHANGE</span>
                  </div>
                  <input
                    type="file" ref={editFileInputRef} onChange={handleEditFileChange}
                    className="hidden" accept="image/jpeg,image/png,image/webp"
                  />
                </div>
                <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[12px] font-bold text-slate-800 uppercase">Publish immediately</p>
                  <p className="text-[10px] text-slate-400">Off = saved as draft.</p>
                </div>
                <div
                  onClick={() => setSelectedProduct((p) => ({ ...p, is_published: !p.is_published }))}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${selectedProduct.is_published ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${selectedProduct.is_published ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t flex items-center justify-between bg-slate-50/20">
              <button
                type="button" onClick={handleDelete} disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg bg-white hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={14} /> Delete Product
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); setEditErrors({}); }}
                  className="px-8 py-2.5 text-[11px] font-bold border rounded-lg bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isLoading}
                  className="px-8 py-2.5 bg-[#F5B841] text-white rounded-lg text-[11px] font-bold uppercase shadow-sm disabled:opacity-60 hover:bg-[#E0A83B] active:scale-95 transition-all"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center p-8 relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-xl font-black">!</span>
                </div>
              </div>
            </div>

            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Delete this product?</h2>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-7">
              This product will be permanently deleted from your store and cannot be recovered.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-64 right-0 bg-[#125852] text-white py-2 px-8 flex justify-between items-center text-[9px] z-40">
        <div>Buy Smart. Sell Fast. Grow Together...</div>
        <div>© 2026 Vendor Portal. All rights reserved.</div>
      </footer>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SidebarLink = ({ to, icon, label, active = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
      active
        ? 'bg-[#E0F2F1] text-[#125852]'
        : 'text-slate-400 hover:text-slate-900'
    }`}
  >
    {icon}<span>{label}</span>
  </Link>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className="p-2 bg-white rounded-lg shadow-sm w-fit">{icon}</div>
  </div>
);

const ProductCard = ({ product, currencySymbol, onClick }) => {
  const rawQty = product.inventory_quality || product.qty || 'Medium';
  const qty = QTY_DISPLAY[rawQty] || rawQty;

  const getQualityColor = () => {
    const q = qty.toLowerCase();
    if (q === 'low')    return 'bg-red-50 text-red-600';
    if (q === 'medium') return 'bg-orange-50 text-orange-600';
    return 'bg-teal-50 text-teal-600';
  };

  const imageUrl = product.image || product.image_url || product.images?.[0]?.image || null;

  const parseSaved = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split(',').map((s) => s.trim()).filter(Boolean); }
  };
  const sizes  = parseSaved(product.sizes  || product.size_variants);
  const colors = parseSaved(product.colors || product.color_variants);

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-contain" />
        ) : (
          <ShoppingBag className="text-slate-200" size={40} />
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-black uppercase shadow-sm ${getQualityColor()}`}>
          {qty}
        </span>
        <div className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <Pencil size={12} className="text-[#125852]" />
        </div>
      </div>

      <div className="p-5 border-t border-slate-50">
        <p className="text-[9px] font-black text-[#125852] uppercase mb-1 tracking-wider">{product.category}</p>
        <h4 className="text-[13px] font-bold text-slate-900 mb-1 truncate">{product.title}</h4>
        <div className="text-[10px] text-slate-400 font-medium mb-2 uppercase">
          {product.vendor_location || product.location || 'Unknown Location'}
        </div>

        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {sizes.slice(0, 4).map((s) => (
              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-bold rounded">{s}</span>
            ))}
            {sizes.length > 4 && <span className="text-[8px] text-slate-400 self-center">+{sizes.length - 4}</span>}
          </div>
        )}

        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {colors.slice(0, 5).map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-bold rounded">{c}</span>
            ))}
            {colors.length > 5 && <span className="text-[8px] text-slate-400 self-center">+{colors.length - 5}</span>}
          </div>
        )}

        <div className="flex justify-between items-end pt-2 border-t border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">SKU</p>
            <p className="text-[11px] font-bold text-slate-700">{product.sku || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Price</p>
            <p className="text-lg font-black text-[#125852]">{currencySymbol} {Number(product.price || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;