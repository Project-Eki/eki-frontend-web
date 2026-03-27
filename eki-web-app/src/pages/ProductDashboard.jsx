import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  X, Upload, Trash2, Pencil, Palette, Ruler, ImagePlus, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, SlidersHorizontal, Briefcase, Clock, Calendar, Star,
  Globe, MapPin
} from 'lucide-react';
import logo from '../assets/eki-logo-white.png';

import {
  getProducts,
  createProductListing,
  updateProductListing,
  deleteProductListing,
  uploadListingImages,
  deleteListingImage,
  getVendorDashboard,
  SignoutUser,
} from '../services/authService';

// ─── Constants
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'one_size'];
const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Purple', 'Pink', 'Brown', 'Grey', 'Navy',
  'Beige', 'Maroon', 'Teal', 'Gold', 'Silver',
];

const COLOR_SWATCHES = {
  Black: '#1a1a1a', White: '#f5f5f5', Red: '#ef4444', Blue: '#3b82f6',
  Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Purple: '#a855f7',
  Pink: '#ec4899', Brown: '#92400e', Grey: '#6b7280', Navy: '#1e3a5f',
  Beige: '#d2b48c', Maroon: '#800000', Teal: '#14b8a6', Gold: '#d4af37',
  Silver: '#c0c0c0',
};

// COLOR MAP — used by the stat cards to pick their icon + value colors.
const colorMap = {
  teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   val: "text-teal-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  val: "text-green-700"  },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  val: "text-amber-700"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", val: "text-purple-700" },
};

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

const MAX_IMAGES_PER_COLOR = 3;
const MAX_GENERAL_IMAGES   = 6;

const blankForm = () => ({
  title: '', category: '', price: '', sku: '', qty: 'Medium',
  location: '', description: '',
  imageFiles: [],
  sizes: [],
  colors: [],
  colorImageFiles: {},
});

const isStep1Valid = (data) =>
  data.title?.trim().length > 0 &&
  data.price &&
  !isNaN(Number(data.price)) &&
  Number(data.price) > 0;

const getQualityStyle = (qty) => {
  const q = (qty || '').toLowerCase();
  if (q === 'high')   return { bg: '#FFF8E7', text: '#B8860B', border: '#F5B841' };
  if (q === 'low')    return { bg: '#FFF3E0', text: '#C07000', border: '#E09030' };
  return               { bg: '#FFFBF0', text: '#A07800', border: '#F5C842' };
};

// STATUS STYLE MAP — used inside ProductCard
const STATUS_STYLE = {
  published: "bg-green-50 text-green-700 border border-green-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
};

// ─── Main Component
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
  const [sortBy, setSortBy]                         = useState("newest");

  const [formStep, setFormStep]                     = useState(1);

  const fileInputRef           = useRef(null);
  const editFileInputRef       = useRef(null);
  const colorFileInputRefs     = useRef({});
  const editColorFileInputRefs = useRef({});

  const [formData, setFormData]     = useState(blankForm());
  const [errors, setErrors]         = useState({});
  const [editErrors, setEditErrors] = useState({});

  const step1Valid = isStep1Valid(formData);

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
      if (data?.businessCategory) setBusinessCategory(data.businessCategory);
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

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_GENERAL_IMAGES - formData.imageFiles.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFiles: [...prev.imageFiles, { preview: reader.result, file }],
        }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCreateImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const handleColorFilesChange = (color, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const existing = formData.colorImageFiles[color] || [];
    const remaining = MAX_IMAGES_PER_COLOR - existing.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          colorImageFiles: {
            ...prev.colorImageFiles,
            [color]: [...(prev.colorImageFiles[color] || []), { preview: reader.result, file }],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
    if (colorFileInputRefs.current[color]) colorFileInputRefs.current[color].value = '';
  };

  const removeColorCreateImage = (color, index) => {
    setFormData((prev) => ({
      ...prev,
      colorImageFiles: {
        ...prev.colorImageFiles,
        [color]: (prev.colorImageFiles[color] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleEditFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const existingCount = (selectedProduct.images?.length || 0) +
                          (selectedProduct.newImageFiles?.length || 0);
    const remaining = MAX_GENERAL_IMAGES - existingCount;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prev) => ({
          ...prev,
          newImageFiles: [...(prev.newImageFiles || []), { preview: reader.result, file }],
        }));
      };
      reader.readAsDataURL(file);
    });
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const removeNewEditImage = (index) => {
    setSelectedProduct((prev) => ({
      ...prev,
      newImageFiles: (prev.newImageFiles || []).filter((_, i) => i !== index),
    }));
  };

  const handleDeleteExistingImage = async (imageId, index) => {
    if (!selectedProduct?.id) return;
    try {
      await deleteListingImage(selectedProduct.id, imageId);
      setSelectedProduct((prev) => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index),
      }));
    } catch (err) {
      console.warn('Failed to delete image', err);
    }
  };

  const handleEditColorFilesChange = (color, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const existing = selectedProduct.colorImageFiles?.[color] || [];
    const remaining = MAX_IMAGES_PER_COLOR - existing.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prev) => ({
          ...prev,
          colorImageFiles: {
            ...(prev.colorImageFiles || {}),
            [color]: [...(prev.colorImageFiles?.[color] || []), { preview: reader.result, file }],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
    if (editColorFileInputRefs.current[color]) editColorFileInputRefs.current[color].value = '';
  };

  const removeEditColorImage = (color, index) => {
    setSelectedProduct((prev) => ({
      ...prev,
      colorImageFiles: {
        ...(prev.colorImageFiles || {}),
        [color]: (prev.colorImageFiles?.[color] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const toggleChip = (field, value, isEdit = false) => {
    if (isEdit) {
      setSelectedProduct((prev) => {
        const arr = prev[field] || [];
        const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
        if (field === 'colors' && arr.includes(value)) {
          const { [value]: _removed, ...rest } = prev.colorImageFiles || {};
          return { ...prev, [field]: next, colorImageFiles: rest };
        }
        return { ...prev, [field]: next };
      });
    } else {
      setFormData((prev) => {
        const arr = prev[field] || [];
        const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
        if (field === 'colors' && arr.includes(value)) {
          const { [value]: _removed, ...rest } = prev.colorImageFiles || {};
          return { ...prev, [field]: next, colorImageFiles: rest };
        }
        return { ...prev, [field]: next };
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

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      errs.price = 'Valid price is required';
    return errs;
  };

  const handleStep1Continue = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setFormStep(2);
  };

  const collectAllFiles = (imageFiles, colorImageFiles) => {
    const general = (imageFiles || []).map((f) => f.file);
    const colored = Object.values(colorImageFiles || {}).flat().map((f) => f.file);
    return [...general, ...colored];
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
      const allFiles = collectAllFiles(formData.imageFiles, formData.colorImageFiles);
      if (allFiles.length > 0 && created?.id) {
        await uploadListingImages(created.id, allFiles);
      }
      await loadProducts();
      setIsProductModalOpen(false);
      setFormData(blankForm());
      setErrors({});
      setIsPublished(true);
      setFormStep(1);
      showSuccess('Product created successfully!');
    } catch (err) {
      console.error('Failed to create product', err);
      const detail = err.response?.data?.errors ?? err.response?.data;
      const msg = detail && typeof detail === 'object'
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Failed to create product. Please try again.';
      setErrors({ _server: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct({
      ...product,
      is_published:    product.is_published === true || product.status === 'published',
      qty:             QTY_DISPLAY[product.inventory_quality] || product.qty || 'Medium',
      location:        product.vendor_location || product.location || '',
      images:          product.images || [],
      newImageFiles:   [],
      colorImageFiles: {},
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
        is_published: selectedProduct.is_published === true,
        sizes:        selectedProduct.sizes  || [],
        colors:       selectedProduct.colors || [],
      });
      const allFiles = collectAllFiles(
        selectedProduct.newImageFiles,
        selectedProduct.colorImageFiles
      );
      if (allFiles.length > 0) {
        await uploadListingImages(selectedProduct.id, allFiles);
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort based on sortBy
    if (sortBy === 'price_asc') {
      result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [products, searchQuery, sortBy]);

  // ── STATS
  const stats = useMemo(() => [
    {
      label: "Total Products",
      value: products.length.toString(),
      icon:  <Package size={18} />,
      color: "teal",
    },
    {
      label: "Active Listings",
      value: products.filter(p => p.is_published === true).length.toString(),
      icon:  <CheckCircle2 size={18} />,
      color: "green",
    },
    {
      label: "High Quality",
      value: products.filter(p => (p.inventory_quality || p.qty || '').toUpperCase() === 'HIGH').length.toString(),
      icon:  <Star size={18} />,
      color: "amber",
    },
    {
      label: "Drafts",
      value: products.filter(p => p.is_published !== true).length.toString(),
      icon:  <Clock size={18} />,
      color: "purple",
    },
  ], [products]);

  // ─── VariantSection
  const VariantSection = ({ sizes, colors, isEdit = false }) => {
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setColorDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
        <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Product Variants</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Ruler size={13} className="text-slate-400" />
            <label className="text-[11px] font-bold uppercase text-slate-500">Available Sizes</label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIZE_OPTIONS.map((size) => (
              <button
                key={size} type="button"
                onClick={() => toggleChip('sizes', size, isEdit)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
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

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Palette size={13} className="text-slate-400" />
            <label className="text-[11px] font-bold uppercase text-slate-500">Available Colors</label>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setColorDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 hover:border-[#125852] transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap min-h-[18px]">
                {colors.length === 0 ? (
                  <span className="text-slate-400 text-[12px]">Select colors…</span>
                ) : (
                  colors.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2 py-0.5 rounded-full text-[10px] font-bold"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40 flex-shrink-0"
                        style={{ backgroundColor: COLOR_SWATCHES[c] || '#ccc' }}
                      />
                      {c}
                    </span>
                  ))
                )}
              </div>
              {colorDropdownOpen ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
            </button>
            {colorDropdownOpen && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto max-h-48 p-2">
                {COLOR_OPTIONS.map((color) => {
                  const selected = colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleChip('colors', color, isEdit)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        selected ? 'bg-[#125852] text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0"
                        style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }}
                      />
                      {color}
                      {selected && <CheckCircle2 size={12} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {colors.length > 0 && (
            <p className="text-[10px] text-[#125852] font-medium">Selected: {colors.join(', ')}</p>
          )}
        </div>
      </div>
    );
  };

  // ─── General ImageGrid
  const ImageGrid = ({ existingImages = [], pendingImages = [], onRemoveExisting, onRemovePending, onAdd }) => {
    const total = existingImages.length + pendingImages.length;
    const canAddMore = total < MAX_GENERAL_IMAGES;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase text-slate-500">General Product Images</label>
          <span className="text-[9px] text-slate-400">{total}/{MAX_GENERAL_IMAGES}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {existingImages.map((img, i) => (
            <div key={img.id ?? i} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative group flex-shrink-0">
              <img src={img.image} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#125852]/80 text-white text-[7px] font-black text-center py-0.5">MAIN</span>
              )}
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id, i)}
                className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Trash2 size={9} />
              </button>
            </div>
          ))}
          {pendingImages.map((img, i) => (
            <div key={i} className="w-16 h-16 rounded-lg border border-dashed border-[#125852]/50 overflow-hidden relative group flex-shrink-0">
              <img src={img.preview} alt={`New ${i + 1}`} className="w-full h-full object-cover opacity-80" />
              <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-[7px] font-black text-center py-0.5">PENDING</span>
              <button
                type="button"
                onClick={() => onRemovePending(i)}
                className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Trash2 size={9} />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={onAdd}
              className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0"
            >
              <ImagePlus size={16} className="text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 mt-1">ADD</span>
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB · up to {MAX_GENERAL_IMAGES} images · first is main photo</p>
      </div>
    );
  };

  // ─── ColorImageSection
  const ColorImageSection = ({ colors, colorImageFiles, isEdit = false }) => {
    if (!colors || colors.length === 0) return null;
    const fileRefs = isEdit ? editColorFileInputRefs : colorFileInputRefs;
    const handleAdd    = (color) => fileRefs.current[color]?.click();
    const handleChange = isEdit ? handleEditColorFilesChange : handleColorFilesChange;
    const handleRemove = isEdit ? removeEditColorImage : removeColorCreateImage;
    return (
      <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Palette size={13} className="text-[#125852]" />
          <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Images Per Color Variant</h4>
          <span className="text-[9px] text-slate-400 ml-auto">Up to {MAX_IMAGES_PER_COLOR} per colour</span>
        </div>
        {colors.map((color) => {
          const images = colorImageFiles?.[color] || [];
          const canAdd  = images.length < MAX_IMAGES_PER_COLOR;
          return (
            <div key={color} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }}
                />
                <span className="text-[10px] font-bold text-slate-700">{color}</span>
                <span className="text-[8px] text-slate-400">({images.length}/{MAX_IMAGES_PER_COLOR})</span>
              </div>
              <div className="flex flex-wrap gap-2 pl-5">
                {images.map((img, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg border border-dashed border-[#125852]/50 overflow-hidden relative group flex-shrink-0">
                    <img src={img.preview} alt={`${color} ${i + 1}`} className="w-full h-full object-cover opacity-90" />
                    <span
                      className="absolute bottom-0 left-0 right-0 text-center text-[6px] font-black py-0.5 truncate px-1"
                      style={{ backgroundColor: (COLOR_SWATCHES[color] || '#125852') + 'cc', color: '#fff' }}
                    >
                      {color.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(color, i)}
                      className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={7} />
                    </button>
                  </div>
                ))}
                {canAdd && (
                  <button
                    type="button"
                    onClick={() => handleAdd(color)}
                    className="w-14 h-14 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0"
                  >
                    <ImagePlus size={13} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-400 mt-0.5">ADD</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={(el) => { fileRefs.current[color] = el; }}
                  onChange={(e) => handleChange(color, e)}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── ProductCard
  const ProductCard = ({ product, currencySymbol, onClick }) => {
    const rawQty = product.inventory_quality || product.qty || 'Medium';
    const qty = QTY_DISPLAY[rawQty] || rawQty;
    const qualityStyle = getQualityStyle(qty);
    
    const parseSaved = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return val.split(',').map((s) => s.trim()).filter(Boolean); }
    };
    const sizes = parseSaved(product.sizes || product.size_variants);
    const colors = parseSaved(product.colors || product.color_variants);
    
    const mainImageUrl = product.images?.[0]?.image || product.image_url || null;
    
    const status = product.is_published === true || product.status === 'published' ? 'published' : 'draft';

    return (
      <div
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
        onClick={onClick}
      >
        {/* Cover image */}
        <div className="relative h-44 overflow-hidden bg-slate-50">
          {mainImageUrl ? (
            <img
              src={mainImageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <ShoppingBag size={28} className="text-slate-300" />
              <span className="text-[10px] text-slate-300">No image</span>
            </div>
          )}

          {/* Quality badge */}
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border"
            style={{ background: qualityStyle.bg, color: qualityStyle.text, borderColor: qualityStyle.border }}
          >
            {qty}
          </span>

          {/* Status badge */}
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[status] || STATUS_STYLE.draft}`}>
            {status === 'published' ? 'Live' : 'Draft'}
          </span>

          {/* Hover edit indicator */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <Pencil size={12} className="text-[#125852]" />
          </div>
        </div>

        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1 truncate">
              {product.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-black text-[15px] text-slate-900 leading-tight mb-1 line-clamp-1">
            {product.title || '—'}
          </h3>

          {/* Description */}
          <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">
            {product.description || 'No description provided.'}
          </p>

          {/* Colors and Sizes row */}
          <div className="flex items-center justify-between text-[12px] text-slate-400 mb-3">
            {colors.length > 0 && (
              <div className="flex items-center gap-1">
                <Palette size={12} />
                <span className="text-[11px]">
                  {colors.slice(0, 3).join(', ')}
                  {colors.length > 3 && ` +${colors.length - 3}`}
                </span>
              </div>
            )}
            {sizes.length > 0 && (
              <div className="flex items-center gap-1">
                <Ruler size={12} />
                <span className="text-[11px]">
                  {sizes.slice(0, 3).join(', ')}
                  {sizes.length > 3 && ` +${sizes.length - 3}`}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div>
              <span className="text-[21px] font-black text-slate-900">
                {currencySymbol}{Number(product.price || 0).toLocaleString()}
              </span>
            </div>
            <button className="text-[12px] font-bold text-teal-700 hover:text-amber-500 transition-colors flex items-center gap-1">
              View Details <span className="text-[10px]">↗</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar activePage="products" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 size={12} /> {successMsg}
          </div>
        )}

        <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
          {/* ── Page header + Create button ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Product Management</h2>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Manage your inventory, pricing, and visibility across the marketplace.
                {vendorCountry && (
                  <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500 text-[9px]">
                    {vendorCountry} · {currencySymbol}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => { setFormStep(1); setIsProductModalOpen(true); }}
              className="bg-[#F5B841] hover:bg-[#E0A83B] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold text-sm shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          {/* ── Search + filter bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by title, SKU, or keyword..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F5B841] focus:ring-1 focus:ring-[#F5B841] transition-colors"
              />
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors">
                <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Advanced</span> Filters
              </button>
              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewType("grid")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${viewType === "grid" ? "bg-[#125852] text-white" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={15}/>
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${viewType === "list" ? "bg-[#125852] text-white" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={15}/>
                </button>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:border-[#F5B841] appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((s, i) => {
              const c = colorMap[s.color];
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-0.5">
                      {s.label}
                    </p>
                    <p className={`text-[20px] sm:text-[22px] font-black leading-none ${c.val}`}>
                      {isFetching ? '—' : s.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PRODUCTS GRID ── */}
          {isFetching ? (
            <div className={`grid gap-4 ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-4 text-teal-600">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Click "Add New Product" to create your first listing.'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!isFetching && products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing <b>{filteredProducts.length}</b> of <b>{products.length}</b> products
              </p>
              <div className="flex items-center gap-1">
                <button className="h-9 px-3 sm:px-4 border border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#F5B841] hover:text-teal-700 transition-colors font-medium">
                  Previous
                </button>
                <button className="w-9 h-9 rounded-lg text-sm font-bold bg-[#125852] text-white">1</button>
                <button className="h-9 px-3 sm:px-4 bg-[#125852] text-white rounded-lg text-sm font-bold hover:bg-[#0e4440] transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
      </div>

      {/* CREATE PRODUCT MODAL — STEP 1 */}
      {isProductModalOpen && formStep === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left" style={{ height: 'auto' }}>
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Create New Product</h2>
                <p className="text-[11px] text-slate-500">
                  Step 1 of 2 · <span className="font-bold text-[#125852] capitalize">{businessCategory}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); setFormStep(1); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#125852]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#125852] text-white">1</span>
                  Basic Info
                </div>
                <div className="flex-1 h-0.5 rounded-full bg-slate-200" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-slate-200 text-slate-400">2</span>
                  Variants & Images
                </div>
              </div>
            </div>

            <div className="px-6 py-3 space-y-3">
              {errors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-3 py-2 rounded-lg">
                  {errors._server}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. Premium Wireless Headphones"
                  autoComplete="off"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.title && <p className="text-red-500 text-[9px] font-bold">{errors.title}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleInputChange}
                  rows="2" placeholder="Describe your product..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Location</label>
                <input
                  type="text" name="location" value={formData.location} onChange={handleInputChange}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Sub-category</label>
                  <select
                    name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input
                    type="number" name="price" value={formData.price} onChange={handleInputChange}
                    placeholder="0.00" min="0" step="any"
                    autoComplete="off"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {errors.price && <p className="text-red-500 text-[9px] font-bold">{errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                  <input
                    type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                    placeholder="ALP-TSH-M-BLK-L-2026-0001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Quality</label>
                  <select
                    name="qty" value={formData.qty} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button
                type="button"
                onClick={() => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); setFormStep(1); }}
                className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStep1Continue}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                  step1Valid
                    ? 'bg-[#F5B841] text-white hover:bg-[#E0A83B] cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL — STEP 2 */}
      {isProductModalOpen && formStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left"
            style={{ height: 'auto' }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Variants & Images</h2>
                <p className="text-[11px] text-slate-500">
                  Step 2 of 2 · <span className="font-bold text-[#125852] capitalize">{businessCategory}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); setFormStep(1); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#F5B841] text-white">✓</span>
                  Basic Info
                </div>
                <div className="flex-1 h-0.5 rounded-full bg-[#F5B841]" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#125852]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#125852] text-white">2</span>
                  Variants & Images
                </div>
              </div>
            </div>

            <div className="px-6 py-3 space-y-3">
              {errors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-3 py-2 rounded-lg">
                  {errors._server}
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Product</p>
                  <p className="text-[13px] font-bold text-slate-800">{formData.title}</p>
                  <p className="text-[11px] text-[#125852] font-bold mt-0.5">
                    {currencySymbol} {Number(formData.price || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="text-[10px] font-bold text-slate-400 hover:text-[#125852] flex items-center gap-1 mt-1"
                >
                  <ArrowLeft size={12} /> Edit
                </button>
              </div>

              <VariantSection sizes={formData.sizes} colors={formData.colors} isEdit={false} />

              <ImageGrid
                existingImages={[]}
                pendingImages={formData.imageFiles}
                onRemoveExisting={() => {}}
                onRemovePending={removeCreateImage}
                onAdd={() => fileInputRef.current?.click()}
              />
              <input
                type="file" ref={fileInputRef} onChange={handleFilesChange}
                className="hidden" accept="image/jpeg,image/png,image/webp" multiple
              />

              <ColorImageSection
                colors={formData.colors}
                colorImageFiles={formData.colorImageFiles}
                isEdit={false}
              />

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase">Publish immediately</p>
                  <p className="text-[9px] text-slate-400">Off = saved as draft.</p>
                </div>
                <div onClick={() => setIsPublished((prev) => !prev)} className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${isPublished ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
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
          <form onSubmit={handleUpdate} className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold">Edit Product</h2>
                <p className="text-[10px] text-slate-500">Update the details for this product listing.</p>
              </div>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); setEditErrors({}); }}><X size={16} /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {editErrors._server && (<div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium px-3 py-2 rounded-lg">{editErrors._server}</div>)}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Title *</label>
                <input type="text" value={selectedProduct.title || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, title: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.title ? 'border-red-500' : 'border-slate-200'}`} />
                {editErrors.title && <p className="text-red-500 text-[9px] font-bold">{editErrors.title}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Description</label>
                <textarea value={selectedProduct.description || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, description: e.target.value }))} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Location</label>
                <input type="text" value={selectedProduct.location || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Kampala, Uganda" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F5B841]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Sub-category</label>
                  <select value={selectedProduct.category || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white">
                    <option value="">— Select —</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input type="number" value={selectedProduct.price || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, price: e.target.value }))} min="0" step="any" placeholder="0.00" className={`w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.price ? 'border-red-500' : 'border-slate-200'}`} />
                  {editErrors.price && <p className="text-red-500 text-[9px] font-bold">{editErrors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">SKU</label>
                  <input type="text" value={selectedProduct.sku || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, sku: e.target.value }))} placeholder="ALP-TSH-M-BLK-L-2026-0001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Quality</label>
                  <select value={selectedProduct.qty || 'Medium'} onChange={(e) => setSelectedProduct((p) => ({ ...p, qty: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white">
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

              <ImageGrid
                existingImages={selectedProduct.images || []}
                pendingImages={selectedProduct.newImageFiles || []}
                onRemoveExisting={handleDeleteExistingImage}
                onRemovePending={removeNewEditImage}
                onAdd={() => editFileInputRef.current?.click()}
              />
              <input
                type="file" ref={editFileInputRef} onChange={handleEditFilesChange}
                className="hidden" accept="image/jpeg,image/png,image/webp" multiple
              />

              <ColorImageSection
                colors={selectedProduct.colors || []}
                colorImageFiles={selectedProduct.colorImageFiles || {}}
                isEdit={true}
              />

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase">Published</p>
                  <p className="text-[9px] text-slate-400">Off = saved as draft.</p>
                </div>
                <div onClick={() => setSelectedProduct((p) => ({ ...p, is_published: !p.is_published }))} className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${selectedProduct.is_published ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${selectedProduct.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
              <button type="button" onClick={handleDelete} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-red-500 border border-red-200 rounded-lg bg-white hover:bg-red-50 disabled:opacity-60">
                <Trash2 size={12} /> Delete Product
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); setEditErrors({}); }} className="px-5 py-2 text-[10px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-[#F5B841] text-white rounded-lg text-[10px] font-bold uppercase shadow-sm disabled:opacity-60 hover:bg-[#E0A83B] active:scale-95 transition-all">
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
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center p-6 relative">
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"><X size={14} /></button>
            <div className="flex justify-center mb-4"><div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center"><span className="text-red-500 text-lg font-black">!</span></div></div></div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-1.5">Delete this product?</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-5">This product will be permanently deleted from your store and cannot be recovered.</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={isLoading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60">{isLoading ? 'Deleting...' : 'Delete'}</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;