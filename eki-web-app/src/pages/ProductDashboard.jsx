import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar3 from '../components/adminDashboard/Navbar3';
import VendorSidebar from '../components/VendorSidebar';
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  LayoutDashboard, Truck, CreditCard, MessageSquare, Settings, LogOut,
  X, Upload, Trash2, Pencil, Palette, Ruler, ImagePlus, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft,
} from 'lucide-react';

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

// ─── Main Component
const ProductDashboard = () => {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [vendorCountry, setVendorCountry] = useState('');
  const [businessCategory, setBusinessCategory] = useState('retail');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const filterRef = useRef(null);

  // Form Step Logic
  const [formStep, setFormStep] = useState(1);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const colorFileInputRefs = useRef({});
  const editColorFileInputRefs = useRef({});

  const [formData, setFormData] = useState(blankForm());
  const [errors, setErrors] = useState({});
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

  // Image Handlers
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
  };

  const removeCreateImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const toggleChip = (field, value, isEdit = false) => {
    const targetSet = isEdit ? setSelectedProduct : setFormData;
    targetSet((prev) => {
      const arr = prev[field] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  };

  // Submission Logic
  const handlePublish = async (e) => {
    if(e) e.preventDefault();
    setIsLoading(true);
    try {
      const created = await createProductListing({
        ...formData,
        is_published: isPublished,
        business_category: businessCategory,
      });
      const allFiles = [
        ...formData.imageFiles.map(f => f.file),
        ...Object.values(formData.colorImageFiles).flat().map(f => f.file)
      ];
      if (allFiles.length > 0 && created?.id) {
        await uploadListingImages(created.id, allFiles);
      }
      await loadProducts();
      setIsProductModalOpen(false);
      setFormData(blankForm());
      setFormStep(1);
      showSuccess('Product created successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (formStep === 1 && !formData.title) return setErrors({ title: "Title is required" });
    if (formStep === 2 && !formData.price) return setErrors({ price: "Price is required" });
    setFormStep(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      
      {/* SIDEBAR - Using Imported Component with highligted Products */}
      <VendorSideBar activePage="products" />

      <main className="flex-1 px-8 py-6">
        <Navbar3 />

        {/* Success Alert */}
        {successMsg && (
          <div className="fixed top-6 right-6 bg-[#125852] text-white px-6 py-3 rounded-2xl shadow-lg z-[100] animate-in slide-in-from-top-4">
            {successMsg}
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory</h1>
              <p className="text-slate-500 font-medium">Manage your shop listings and stock</p>
            </div>
            <button 
              onClick={() => { setFormStep(1); setIsProductModalOpen(true); }}
              className="bg-[#125852] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#0d423e] transition-all shadow-md active:scale-95"
            >
              <Plus size={20} /> <span className="font-bold">New Product</span>
            </button>
          </div>

          {/* 3-STEP MODAL */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl border border-white">
                
                {/* Modal Header */}
                <div className="p-8 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Add Product</h2>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${formStep >= s ? 'bg-[#F5B841]' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 pt-4">
                  {/* STEP 1: Basic Info */}
                  {formStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Product Name</label>
                        <input 
                          name="title" 
                          value={formData.title} 
                          onChange={handleInputChange} 
                          placeholder="e.g. Classic Leather Tote" 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#F5B841] focus:bg-white transition-all font-bold" 
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleInputChange} 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#F5B841] focus:bg-white appearance-none font-bold"
                        >
                          <option value="">Select a category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Pricing & Variants */}
                  {formStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Price ({currencySymbol})</label>
                          <input 
                            name="price" 
                            type="number" 
                            value={formData.price} 
                            onChange={handleInputChange} 
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#F5B841] font-bold" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Inventory</label>
                          <select 
                            name="qty" 
                            value={formData.qty} 
                            onChange={handleInputChange} 
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                          >
                            <option value="High">High Stock</option>
                            <option value="Medium">Medium Stock</option>
                            <option value="Low">Low Stock</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Available Sizes</label>
                        <div className="flex flex-wrap gap-2">
                          {SIZE_OPTIONS.map(size => (
                            <button 
                              key={size} 
                              type="button"
                              onClick={() => toggleChip('sizes', size)}
                              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.sizes.includes(size) ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-400 border-slate-100'}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Images & Finish */}
                  {formStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="border-4 border-dashed border-slate-50 rounded-[32px] p-10 text-center hover:border-[#F5B841]/20 transition-colors">
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleFilesChange} 
                          className="hidden" 
                          id="p-upload" 
                          accept="image/*"
                        />
                        <label htmlFor="p-upload" className="cursor-pointer">
                          <div className="bg-[#FFF8EE] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#F5B841]">
                            <ImagePlus size={32} />
                          </div>
                          <p className="text-slate-800 font-black">Upload Product Photos</p>
                          <p className="text-slate-400 text-sm mt-1">Select up to 6 high-quality images</p>
                        </label>
                      </div>
                      
                      {formData.imageFiles.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {formData.imageFiles.map((img, i) => (
                            <div key={i} className="relative w-16 h-16 shrink-0">
                              <img src={img.preview} className="w-full h-full object-cover rounded-xl" />
                              <button onClick={() => removeCreateImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <input 
                          type="checkbox" 
                          checked={isPublished} 
                          onChange={(e) => setIsPublished(e.target.checked)} 
                          className="w-5 h-5 accent-[#125852]" 
                        />
                        <span className="text-sm font-bold text-slate-600">Make this product visible in my shop immediately</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="p-8 pt-0 flex gap-4">
                  {formStep > 1 && (
                    <button 
                      onClick={() => setFormStep(prev => prev - 1)} 
                      className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={18} /> Back
                    </button>
                  )}
                  {formStep < 3 ? (
                    <button 
                      onClick={nextStep} 
                      className="flex-[2] py-4 bg-[#125852] text-white rounded-2xl font-black hover:bg-[#0d423e] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#125852]/20"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={handlePublish} 
                      disabled={isLoading} 
                      className="flex-[2] py-4 bg-[#F5B841] text-white rounded-2xl font-black hover:opacity-90 disabled:bg-slate-200 transition-all shadow-lg shadow-[#F5B841]/20"
                    >
                      {isLoading ? "Uploading..." : "Finish & Post Product"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid - Rendering the list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {!isFetching && products.map(product => (
              <div key={product.id} className="group bg-white border border-slate-100 rounded-[32px] p-5 hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-slate-50 rounded-[24px] mb-4 overflow-hidden relative">
                  <img src={product.images?.[0]?.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#125852]">
                    {product.qty} Stock
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 truncate">{product.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[#125852] font-black text-lg">{currencySymbol} {product.price}</p>
                  <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#F5B841] transition-colors">
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDashboard;