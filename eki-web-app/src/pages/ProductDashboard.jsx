import React, { useState, useEffect, useRef } from 'react';
import Navbar3 from '../components/adminDashboard/Navbar3';
import logo from '../assets/logo.jpeg';
import { 
  Plus, Search, Filter, LayoutGrid, List, MoreHorizontal, 
  AlertCircle, CheckCircle2, Package, ShoppingBag,
  LayoutDashboard, Truck, CreditCard, MessageSquare, Settings, LogOut, Tag, Box, X, Upload, Trash2,
  MapPin
} from 'lucide-react';
import { validateProductForm } from '../utils/productValidation';

const ProductDashboard = () => {
  const [viewType, setViewType] = useState('grid');
  const [products, setProducts] = useState([]); 
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', category: 'Electronics', price: '', sku: '', qty: 'Medium',
    location: '', description: '', image: null,
    variants: [{ type: 'Size', value: 'Medium' }, { type: 'Color', value: 'Ocean Blue' }]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('eki_products') || '[]');
    setProducts(savedProducts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault(); // Critical: Stops the page from refreshing
    
    // Check validations
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Validation Failed:", validationErrors);
      return;
    }

    const newProduct = { 
      ...formData, 
      id: Date.now(), 
      status: isPublished ? 'In Stock' : 'Draft'
    };

    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    localStorage.setItem('eki_products', JSON.stringify(updatedProducts));
    
    // Close and Reset
    setIsProductModalOpen(false);
    setFormData({ title: '', category: 'Electronics', price: '', sku: '', qty: 'Medium', location: '', description: '', image: null, variants: [] });
    setErrors({});
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 mb-4"><img src={logo} alt="Eki" className="h-8 w-auto object-contain" /></div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink href="/product-dashboard" icon={<ShoppingBag size={18} />} label="Products" active />
          <SidebarLink href="/service" icon={<Plus size={18} />} label="Services" />
          <SidebarLink href="/order-management" icon={<Truck size={18} />} label="Orders" />
          <SidebarLink href="/payment" icon={<CreditCard size={18} />} label="Payments" />
          <SidebarLink href="/reviews" icon={<MessageSquare size={18} />} label="Reviews" />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <SidebarLink href="/settings" icon={<Settings size={18} />} label="Store Settings" />
          <button className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-bold mt-2">
            <LogOut size={18} /><span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />
        <main className="p-8 max-w-[1400px] mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Management</h1>
              <p className="text-slate-500 text-[12px]">Manage your inventory, pricing, and visibility across the marketplace.</p>
            </div>
            <button 
              onClick={() => setIsProductModalOpen(true)} 
              className="bg-[#125852] text-white px-5 py-2.5 rounded-lg text-[12px] font-bold flex items-center gap-2 hover:bg-[#0e443f] transition-all active:scale-95"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Products" value={products.length} icon={<Package className="text-teal-600" />} />
            <StatCard label="Active Listings" value={products.filter(p => p.status === 'In Stock').length} icon={<CheckCircle2 className="text-teal-600" />} />
            <StatCard label="High Quality" value={products.filter(p => p.qty === 'High').length} icon={<CheckCircle2 className="text-green-500" />} />
            <StatCard label="Drafts" value={products.filter(p => p.status === 'Draft').length} icon={<Box className="text-slate-400" />} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="relative w-80">
              <input type="text" placeholder="Search by title or SKU..." className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><Filter size={14}/> Filters</button>
              <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
              <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-slate-100' : ''}`}><LayoutGrid size={16}/></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-slate-100' : ''}`}><List size={16}/></button>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <ShoppingBag className="text-slate-200 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-slate-500 text-sm">Start by adding your first product to the catalog.</p>
            </div>
          ) : (
            <div className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handlePublish} className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New Product</h2>
                <p className="text-[12px] text-slate-500">Fill in the details below to list a new product in your store catalog.</p>
              </div>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Product Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Premium Wireless Headphones" className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none`} />
                {errors.title && <p className="text-red-500 text-[10px] font-bold">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Vendor Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Lagos, Nigeria" className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.location ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none">
                    <option>Electronics</option><option>Computers</option><option>Grocery</option><option>Home & Decor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Base Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className={`w-full pl-8 pr-4 py-2.5 bg-slate-50 border ${errors.price ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-tighter">SKU</label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="PRD-XXXX" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-tighter">Inventory Quality</label>
                  <div className="relative">
                    <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select name="qty" value={formData.qty} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none">
                      <option value="High">High Quality</option>
                      <option value="Medium">Medium Quality</option>
                      <option value="Low">Low Quality</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase">Product Images</label>
                <div className="flex gap-3">
                  {formData.image && (
                    <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden shadow-sm relative group">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, image: null})} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  <div onClick={handleImageClick} className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#125852] hover:bg-slate-50 transition-all">
                    <Upload size={18} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Upload</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Product Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Describe your product..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none h-28"></textarea>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-400" />
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Product Variants</h3>
                  </div>
                  <button type="button" className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:shadow-sm transition-all">+ Add Variant</button>
                </div>
                <div className="space-y-3">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">{v.type}</div>
                      <div className="flex-[2] bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">{v.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-1">
                <div>
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase">Publish Status</h3>
                  <p className="text-[10px] text-slate-400">Make this product visible immediately.</p>
                </div>
                <div onClick={() => setIsPublished(!isPublished)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isPublished ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 italic">Save to drafts to complete later.</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2.5 text-[12px] font-bold text-slate-600 border border-slate-300 rounded-lg bg-white hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#F5B841] text-white rounded-lg text-[12px] font-bold hover:bg-[#E0A83B] uppercase shadow-md active:scale-95 transition-all">Publish Product</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Internal Components
const SidebarLink = ({ href, icon, label, active = false }) => (
  <a href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${active ? 'bg-[#125852] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>{icon}<span>{label}</span></a>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
    <div><p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p><p className="text-2xl font-black text-slate-800 mt-1">{value}</p></div>
    <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
  </div>
);

const ProductCard = ({ product }) => {
  const getQualityColor = () => {
    if (product.qty === 'Low') return 'bg-red-50 text-red-600';
    if (product.qty === 'Medium') return 'bg-orange-50 text-orange-600';
    return 'bg-teal-50 text-teal-600';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative h-48 bg-slate-100 p-4 flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt="" className="w-full h-full object-contain" />
        ) : (
          <ShoppingBag className="text-slate-200" size={40}/>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-black uppercase shadow-sm ${getQualityColor()}`}>
          {product.qty} Quality
        </span>
      </div>
      <div className="p-5 border-t border-slate-50">
        <p className="text-[9px] font-black text-[#125852] uppercase mb-1 tracking-wider">{product.category}</p>
        <h4 className="text-[13px] font-bold text-slate-900 mb-1 truncate">{product.title}</h4>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-4 uppercase">
           <MapPin size={10} /> {product.location || 'Unknown Location'}
        </div>
        <div className="flex justify-between items-end pt-2 border-t border-slate-100">
          <div><p className="text-[9px] text-slate-400 uppercase font-bold">SKU</p><p className="text-[11px] font-bold text-slate-700">{product.sku || 'N/A'}</p></div>
          <div className="text-right"><p className="text-[9px] text-slate-400 uppercase font-bold">Price</p><p className="text-lg font-black text-[#125852]">${product.price}</p></div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;