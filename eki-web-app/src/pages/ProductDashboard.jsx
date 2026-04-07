import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import {
  Plus, Search, Filter, LayoutGrid, List,
  CheckCircle2, Package, ShoppingBag,
  X, Upload, Trash2, Pencil, Palette, Ruler, ImagePlus, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, Eye, ChevronLeft, ChevronRight, CreditCard, Box, ListChecks,
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

// ─── Constants ────────────────────────────────────────────────────────────────
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
const DESC_MIN_WORDS = 5;
const DESC_MAX_WORDS = 21;

const countWords = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

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

// ─── Stat Card Component (exactly matching VendorDashboard) ───────────────────
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

// ─── ProductCard (unchanged) ──────────────────────────────────────────────────
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

// ─── Color Image Preview Modal (defined OUTSIDE main component — never recreated) ─
const ColorImagePreviewModal = ({ color, images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) return null;
  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const currentSrc = images[currentIndex]?.preview || images[currentIndex]?.image || null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }} />
            <span className="text-[12px] font-bold text-slate-800">{color}</span>
            <span className="text-[10px] text-slate-400">({images.length} photo{images.length !== 1 ? 's' : ''})</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="relative bg-[#F8F8F8]" style={{ aspectRatio: '1 / 1.1' }}>
          {currentSrc ? (
            <img src={currentSrc} alt={`${color} ${currentIndex + 1}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={40} className="text-slate-200" /></div>
          )}
          {images.length > 1 && (
            <>
              <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center transition-all">
                <ChevronLeft size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center transition-all">
                <ChevronRight size={16} className="text-slate-700" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow" style={{ backgroundColor: COLOR_SWATCHES[color] || '#125852' }}>
            {color.toUpperCase()}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50 overflow-x-auto">
            {images.map((img, i) => {
              const src = img.preview || img.image || null;
              return (
                <button key={i} type="button" onClick={() => setCurrentIndex(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-[#125852] shadow-md' : 'border-transparent opacity-60 hover:opacity-90'}`}
                >
                  {src ? <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><ShoppingBag size={14} className="text-slate-400" /></div>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── StepProgressBar (defined OUTSIDE — stable, no re-creation) ───────────────
const StepProgressBar = ({ currentStep, totalSteps = 4, labels = ['Basic Info', 'Description', 'Variants', 'Images'] }) => (
  <div className="px-6 pt-3 pb-2 flex-shrink-0">
    <div className="flex items-center gap-1.5">
      {labels.map((label, idx) => {
        const step = idx + 1;
        const done   = step < currentStep;
        const active = step === currentStep;
        return (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${active ? 'text-[#125852]' : done ? 'text-slate-400' : 'text-slate-300'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${done ? 'bg-[#F5B841] text-white' : active ? 'bg-[#125852] text-white' : 'bg-slate-200 text-slate-400'}`}>
                {done ? '✓' : step}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {idx < labels.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${done ? 'bg-[#F5B841]' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ─── DescriptionField (defined OUTSIDE main component) ────────────────────────
const DescriptionField = ({ value, onChange, error }) => {
  const words    = countWords(value);
  const tooShort = value && value.trim() && words < DESC_MIN_WORDS;
  const tooLong  = DESC_MAX_WORDS && words > DESC_MAX_WORDS;
  const valid    = value && value.trim() && words >= DESC_MIN_WORDS && (!DESC_MAX_WORDS || words <= DESC_MAX_WORDS);
  const barWidth = Math.min(100, DESC_MAX_WORDS ? Math.round((words / DESC_MAX_WORDS) * 100) : 0);
  const barColor = tooLong ? '#ef4444' : valid ? '#22c55e' : tooShort ? '#f97316' : '#e2e8f0';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase text-slate-500">
          Description <span className="text-slate-400 normal-case font-normal">({DESC_MIN_WORDS}–{DESC_MAX_WORDS} words)</span>
        </label>
        <span className={`text-[9px] font-bold ${tooLong ? 'text-red-500' : valid ? 'text-green-500' : 'text-slate-400'}`}>
          {words} / {DESC_MAX_WORDS}
        </span>
      </div>
      <textarea
        name="description"
        value={value}
        onChange={onChange}
        rows={5}
        placeholder={`Describe your product in ${DESC_MIN_WORDS}–${DESC_MAX_WORDS} words…`}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none resize-none focus:ring-1 transition-colors ${
          error ? 'border-red-400 focus:ring-red-300' : valid ? 'border-green-400 focus:ring-green-300' : 'border-slate-200 focus:ring-[#F5B841]'
        }`}
      />
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
      </div>
      <div className="min-h-[14px]">
        {error && <p className="text-red-500 text-[9px] font-bold">{error}</p>}
        {!error && valid && <p className="text-green-500 text-[9px] font-bold">✓ Good description</p>}
        {!error && tooShort && words > 0 && <p className="text-orange-500 text-[9px]">{DESC_MIN_WORDS - words} more word{DESC_MIN_WORDS - words !== 1 ? 's' : ''} needed</p>}
        {!error && tooLong && <p className="text-red-500 text-[9px] font-bold">{words - DESC_MAX_WORDS} word{words - DESC_MAX_WORDS !== 1 ? 's' : ''} over the limit</p>}
      </div>
    </div>
  );
};

// ─── VariantSection (defined OUTSIDE main component) ─────────────────────────
const VariantSection = ({ sizes, colors, onToggleChip }) => {
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setColorDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
      <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Product Variants</h4>

      {/* Sizes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Ruler size={13} className="text-slate-400" />
          <label className="text-[11px] font-bold uppercase text-slate-500">Available Sizes</label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size} type="button"
              onClick={() => onToggleChip('sizes', size)}
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
        {sizes.length > 0 && <p className="text-[10px] text-[#125852] font-medium">Selected: {sizes.join(', ')}</p>}
      </div>

      {/* Colors */}
      <div className="space-y-2">
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
                  <span key={c} className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 flex-shrink-0" style={{ backgroundColor: COLOR_SWATCHES[c] || '#ccc' }} />
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
                    key={color} type="button"
                    onClick={() => onToggleChip('colors', color)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selected ? 'bg-[#125852] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }} />
                    {color}
                    {selected && <CheckCircle2 size={12} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {colors.length > 0 && <p className="text-[10px] text-[#125852] font-medium">Selected: {colors.join(', ')}</p>}
      </div>
    </div>
  );
};

// ─── ImageGrid (defined OUTSIDE) ──────────────────────────────────────────────
const ImageGrid = ({ existingImages = [], pendingImages = [], onRemoveExisting, onRemovePending, onAdd }) => {
  const total      = existingImages.length + pendingImages.length;
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
            {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-[#125852]/80 text-white text-[7px] font-black text-center py-0.5">MAIN</span>}
            <button type="button" onClick={() => onRemoveExisting(img.id, i)} className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <Trash2 size={9} />
            </button>
          </div>
        ))}
        {pendingImages.map((img, i) => (
          <div key={i} className="w-16 h-16 rounded-lg border border-dashed border-[#125852]/50 overflow-hidden relative group flex-shrink-0">
            <img src={img.preview} alt={`New ${i + 1}`} className="w-full h-full object-cover opacity-80" />
            <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white text-[7px] font-black text-center py-0.5">PENDING</span>
            <button type="button" onClick={() => onRemovePending(i)} className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <Trash2 size={9} />
            </button>
          </div>
        ))}
        {canAddMore && (
          <button type="button" onClick={onAdd} className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0">
            <ImagePlus size={16} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 mt-1">ADD</span>
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB · up to {MAX_GENERAL_IMAGES} images · first is main photo</p>
    </div>
  );
};

// ─── ColorImageSection (defined OUTSIDE) ──────────────────────────────────────
const ColorImageSection = ({
  colors, colorImageFiles,
  fileRefs, onAdd, onChange, onRemove, onPreview,
}) => {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
      <div className="flex items-center gap-2">
        <Palette size={13} className="text-[#125852]" />
        <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Images Per Color Variant</h4>
        <span className="text-[9px] text-slate-400 ml-auto">Up to {MAX_IMAGES_PER_COLOR} per colour</span>
      </div>
      {colors.map((color) => {
        const images   = colorImageFiles?.[color] || [];
        const canAdd   = images.length < MAX_IMAGES_PER_COLOR;
        const hasImages = images.length > 0;
        return (
          <div key={color} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 shadow-sm" style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }} />
              <span className="text-[10px] font-bold text-slate-700">{color}</span>
              <span className="text-[8px] text-slate-400">({images.length}/{MAX_IMAGES_PER_COLOR})</span>
              {hasImages && (
                <button
                  type="button"
                  onClick={() => onPreview(color, images)}
                  className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: (COLOR_SWATCHES[color] || '#125852') + '18',
                    color: COLOR_SWATCHES[color] === '#f5f5f5' ? '#374151' : (COLOR_SWATCHES[color] || '#125852'),
                    borderColor: (COLOR_SWATCHES[color] || '#125852') + '40',
                  }}
                >
                  <Eye size={9} /> View {images.length} photo{images.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pl-5">
              {images.map((img, i) => (
                <div key={i} className="w-14 h-14 rounded-lg border border-dashed border-[#125852]/50 overflow-hidden relative group flex-shrink-0">
                  <img src={img.preview} alt={`${color} ${i + 1}`} className="w-full h-full object-cover opacity-90" />
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[6px] font-black py-0.5 truncate px-1" style={{ backgroundColor: (COLOR_SWATCHES[color] || '#125852') + 'cc', color: '#fff' }}>
                    {color.toUpperCase()}
                  </span>
                  <button type="button" onClick={() => onRemove(color, i)} className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Trash2 size={7} />
                  </button>
                </div>
              ))}
              {canAdd && (
                <button type="button" onClick={() => onAdd(color)} className="w-14 h-14 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0">
                  <ImagePlus size={13} className="text-slate-400" />
                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">ADD</span>
                </button>
              )}
              <input
                type="file"
                ref={(el) => { fileRefs.current[color] = el; }}
                onChange={(e) => onChange(color, e)}
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

// ─── SummaryPill — mini recap shown at top of steps 2–4 ──────────────────────
const SummaryPill = ({ formData, currencySymbol, currentStep, onEdit }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Summary</p>
        <p className="text-[13px] font-bold text-slate-800 truncate">{formData.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-[#125852] font-bold">{currencySymbol} {Number(formData.price || 0).toLocaleString()}</span>
          {formData.category && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{formData.category}</span>}
          {formData.sizes?.length > 0 && <span className="text-[9px] bg-[#125852]/10 text-[#125852] px-1.5 py-0.5 rounded-full">{formData.sizes.length} size{formData.sizes.length !== 1 ? 's' : ''}</span>}
          {formData.colors?.length > 0 && <span className="text-[9px] bg-[#125852]/10 text-[#125852] px-1.5 py-0.5 rounded-full">{formData.colors.length} color{formData.colors.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      {currentStep > 1 && (
        <button type="button" onClick={() => onEdit(1)} className="text-[10px] font-bold text-slate-400 hover:text-[#125852] flex items-center gap-1 ml-2 mt-1 flex-shrink-0">
          <ArrowLeft size={12} /> Edit
        </button>
      )}
    </div>
  </div>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────
const ModalShell = ({ title, subtitle, step, onClose, children, footer }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Progress */}
      <StepProgressBar currentStep={step} />

      {/* Body */}
      <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
        {children}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-slate-50/30 flex justify-between items-center flex-shrink-0">
        {footer}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [searchFocused, setSearchFocused]           = useState(false);
  const [successMsg, setSuccessMsg]                 = useState('');
  const [isFilterOpen, setIsFilterOpen]             = useState(false);
  const [filterCategory, setFilterCategory]         = useState('');
  const [filterStatus, setFilterStatus]             = useState('');
  const [filterQuality, setFilterQuality]           = useState('');
  const filterRef                                   = useRef(null);

  // 4-step form
  const [formStep, setFormStep]                     = useState(1);
  const [colorPreviewModal, setColorPreviewModal]   = useState(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVendorInfo = async () => {
    try {
      const data = await getVendorDashboard();
      if (data?.country) { setVendorCountry(data.country); setCurrencySymbol(getCurrencySymbol(data.country)); }
      if (data?.businessCategory) setBusinessCategory(data.businessCategory);
    } catch (err) { console.error('Failed to load vendor info', err); }
  };

  const loadProducts = async () => {
    setIsFetching(true);
    try { setProducts(await getProducts()); }
    catch (err) { console.error('Failed to load products', err); }
    finally { setIsFetching(false); }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_GENERAL_IMAGES - formData.imageFiles.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, { preview: reader.result, file }] }));
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCreateImage = (index) => setFormData((prev) => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }));

  const handleColorFilesChange = (color, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES_PER_COLOR - (formData.colorImageFiles[color] || []).length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({
        ...prev,
        colorImageFiles: { ...prev.colorImageFiles, [color]: [...(prev.colorImageFiles[color] || []), { preview: reader.result, file }] },
      }));
      reader.readAsDataURL(file);
    });
    if (colorFileInputRefs.current[color]) colorFileInputRefs.current[color].value = '';
  };

  const removeColorCreateImage = (color, index) => setFormData((prev) => ({
    ...prev,
    colorImageFiles: { ...prev.colorImageFiles, [color]: (prev.colorImageFiles[color] || []).filter((_, i) => i !== index) },
  }));

  const handleEditFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const existingCount = (selectedProduct.images?.length || 0) + (selectedProduct.newImageFiles?.length || 0);
    const remaining = MAX_GENERAL_IMAGES - existingCount;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedProduct((prev) => ({ ...prev, newImageFiles: [...(prev.newImageFiles || []), { preview: reader.result, file }] }));
      reader.readAsDataURL(file);
    });
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const removeNewEditImage = (index) => setSelectedProduct((prev) => ({ ...prev, newImageFiles: (prev.newImageFiles || []).filter((_, i) => i !== index) }));

  const handleDeleteExistingImage = async (imageId, index) => {
    if (!selectedProduct?.id) return;
    try {
      await deleteListingImage(selectedProduct.id, imageId);
      setSelectedProduct((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
    } catch (err) { console.warn('Failed to delete image', err); }
  };

  const handleEditColorFilesChange = (color, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES_PER_COLOR - (selectedProduct.colorImageFiles?.[color] || []).length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedProduct((prev) => ({
        ...prev,
        colorImageFiles: { ...(prev.colorImageFiles || {}), [color]: [...(prev.colorImageFiles?.[color] || []), { preview: reader.result, file }] },
      }));
      reader.readAsDataURL(file);
    });
    if (editColorFileInputRefs.current[color]) editColorFileInputRefs.current[color].value = '';
  };

  const removeEditColorImage = (color, index) => setSelectedProduct((prev) => ({
    ...prev,
    colorImageFiles: { ...(prev.colorImageFiles || {}), [color]: (prev.colorImageFiles?.[color] || []).filter((_, i) => i !== index) },
  }));

  // toggleChip for CREATE form
  const toggleChip = (field, value) => {
    setFormData((prev) => {
      const arr  = prev[field] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      if (field === 'colors' && arr.includes(value)) {
        const { [value]: _removed, ...rest } = prev.colorImageFiles || {};
        return { ...prev, [field]: next, colorImageFiles: rest };
      }
      return { ...prev, [field]: next };
    });
  };

  // toggleChip for EDIT form
  const toggleEditChip = (field, value) => {
    setSelectedProduct((prev) => {
      const arr  = prev[field] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      if (field === 'colors' && arr.includes(value)) {
        const { [value]: _removed, ...rest } = prev.colorImageFiles || {};
        return { ...prev, [field]: next, colorImageFiles: rest };
      }
      return { ...prev, [field]: next };
    });
  };

  const validateForm = (data) => {
    const errs = {};
    if (!data.title?.trim()) errs.title = 'Title is required';
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) errs.price = 'Valid price is required';
    const wordCount = countWords(data.description);
    if (data.description && data.description.trim()) {
      if (wordCount < DESC_MIN_WORDS) errs.description = `Too short (${wordCount} word${wordCount !== 1 ? 's' : ''}). Min ${DESC_MIN_WORDS} words.`;
      else if (DESC_MAX_WORDS && wordCount > DESC_MAX_WORDS) errs.description = `Too long (${wordCount} words). Max ${DESC_MAX_WORDS} words.`;
    }
    return errs;
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) errs.price = 'Valid price is required';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    const wordCount = countWords(formData.description);
    if (formData.description && formData.description.trim()) {
      if (wordCount < DESC_MIN_WORDS) errs.description = `Too short (${wordCount} word${wordCount !== 1 ? 's' : ''}). Please write at least ${DESC_MIN_WORDS} words.`;
      else if (DESC_MAX_WORDS && wordCount > DESC_MAX_WORDS) errs.description = `Too long (${wordCount} words). Max ${DESC_MAX_WORDS} words.`;
    }
    return errs;
  };

  const handleStep1Continue = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setFormStep(2);
  };

  const handleStep2Continue = () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setFormStep(3);
  };

  const handleStep3Continue = () => {
    setErrors({});
    setFormStep(4);
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
        title: formData.title, description: formData.description,
        location: formData.location, price: formData.price,
        sku: formData.sku, qty: formData.qty,
        sizes: formData.sizes, colors: formData.colors,
        is_published: isPublished, business_category: businessCategory,
      });
      const allFiles = collectAllFiles(formData.imageFiles, formData.colorImageFiles);
      if (allFiles.length > 0 && created?.id) await uploadListingImages(created.id, allFiles);
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
    } finally { setIsLoading(false); }
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
        title: selectedProduct.title, price: selectedProduct.price,
        sku: selectedProduct.sku, qty: selectedProduct.qty,
        location: selectedProduct.location, description: selectedProduct.description,
        is_published: selectedProduct.is_published === true,
        sizes: selectedProduct.sizes || [], colors: selectedProduct.colors || [],
      });
      const allFiles = collectAllFiles(selectedProduct.newImageFiles, selectedProduct.colorImageFiles);
      if (allFiles.length > 0) await uploadListingImages(selectedProduct.id, allFiles);
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
    } finally { setIsLoading(false); }
  };

  const handleDelete   = () => { if (!selectedProduct?.id) return; setIsDeleteModalOpen(true); };
  const confirmDelete  = async () => {
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
    } finally { setIsLoading(false); }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch   = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesStatus   = !filterStatus || (filterStatus === 'published' && p.is_published === true) || (filterStatus === 'draft' && p.is_published !== true);
    const rawQty          = (p.inventory_quality || p.qty || '').toUpperCase();
    const matchesQuality  = !filterQuality || rawQty === filterQuality.toUpperCase();
    return matchesSearch && matchesCategory && matchesStatus && matchesQuality;
  });

  const activeFilterCount = [filterCategory, filterStatus, filterQuality].filter(Boolean).length;
  const clearFilters = () => { setFilterCategory(''); setFilterStatus(''); setFilterQuality(''); };

  const closeCreateModal = () => { setIsProductModalOpen(false); setFormData(blankForm()); setErrors({}); setFormStep(1); };

  // ─── Shared footer nav buttons
  const navButtons = (onBack, onNext, nextLabel = 'Continue', nextIcon = <ArrowRight size={13} />, nextDisabled = false, isSubmit = false) => (
    <>
      <button type="button" onClick={onBack} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
        <ArrowLeft size={13} /> Back
      </button>
      <button
        type={isSubmit ? 'submit' : 'button'}
        onClick={isSubmit ? undefined : onNext}
        disabled={nextDisabled || isLoading}
        className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
          nextDisabled || isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#F5B841] text-white hover:bg-[#E0A83B] cursor-pointer'
        }`}
      >
        {isLoading && isSubmit ? 'Saving…' : nextLabel} {!isLoading && nextIcon}
      </button>
    </>
  );

  // ─── Error banner
  const ErrorBanner = ({ msg }) => msg ? (
    <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-3 py-2 rounded-lg">{msg}</div>
  ) : null;

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="products" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 size={12} /> {successMsg}
          </div>
        )}

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          {/* ─── Header */}
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
              onClick={() => { setFormStep(1); setIsProductModalOpen(true); }}
              className="bg-[#F5B841] text-white px-5 py-2.5 rounded-lg text-[12px] font-bold flex items-center gap-2 hover:bg-[#E0A83B] transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} /> Add New Product
            </button>
          </div>

          {/* ─── Stat cards (exactly matching VendorDashboard style) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Total Products"
              number={products.length}
              icon={Package}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Active Listings"
              number={products.filter((p) => p.is_published === true).length}
              icon={ListChecks}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="High Quality"
              number={products.filter((p) => (p.inventory_quality || p.qty || '').toUpperCase() === 'HIGH').length}
              icon={Box}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Drafts"
              number={products.filter((p) => p.is_published !== true).length}
              icon={CreditCard}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          </div>

          {/* ─── Search + Filter + View toggle */}
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className={`relative w-80 flex items-center border rounded-lg shadow-sm transition-all bg-white ${searchFocused ? 'border-[#F5B841] ring-1 ring-[#F5B841]' : 'border-slate-200'}`}>
              <Search className={`absolute left-3 transition-colors ${searchFocused ? 'text-[#F5B841]' : 'text-slate-400'}`} size={16} />
              <input
                type="text" placeholder="Search by title or SKU..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none rounded-lg"
              />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${activeFilterCount > 0 ? 'bg-[#F5B841] text-white border-[#F5B841] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#F5B841]'}`}
                >
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && <span className="bg-white text-[#F5B841] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-72">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Filter Products</h3>
                      {activeFilterCount > 0 && <button onClick={clearFilters} className="text-[10px] font-bold text-[#F5B841] hover:underline">Clear all</button>}
                    </div>
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Status</label>
                      <div className="flex gap-2 flex-wrap">
                        {['', 'published', 'draft'].map((s) => (
                          <button key={s} type="button" onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterStatus === s ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852]'}`}
                          >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Quality</label>
                      <div className="flex gap-2 flex-wrap">
                        {['', 'High', 'Medium', 'Low'].map((q) => (
                          <button key={q} type="button" onClick={() => setFilterQuality(q)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filterQuality === q ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852]'}`}
                          >
                            {q === '' ? 'All' : q}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Category</label>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px] bg-white outline-none focus:border-[#125852]"
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
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
                <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-slate-100' : ''}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-slate-100' : ''}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active:</span>
              {filterStatus   && <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">{filterStatus}<button onClick={() => setFilterStatus('')}><X size={9} /></button></span>}
              {filterQuality  && <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">{filterQuality}<button onClick={() => setFilterQuality('')}><X size={9} /></button></span>}
              {filterCategory && <span className="flex items-center gap-1 bg-[#125852]/10 text-[#125852] px-2.5 py-1 rounded-full text-[10px] font-bold">{filterCategory}<button onClick={() => setFilterCategory('')}><X size={9} /></button></span>}
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
              <h3 className="text-lg font-bold text-slate-800">{activeFilterCount > 0 || searchQuery ? 'No matching products' : 'No products found'}</h3>
              <p className="text-slate-500 text-sm mb-6">{activeFilterCount > 0 || searchQuery ? 'Try adjusting your search or filters.' : 'Start by adding your first product to the catalog.'}</p>
              {!activeFilterCount && !searchQuery && (
                <button onClick={() => { setFormStep(1); setIsProductModalOpen(true); }} className="bg-[#F5B841] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-[#E0A83B]">
                  <Plus size={16} /> Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className={viewType === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} onClick={() => handleProductClick(product)} />
              ))}
            </div>
          )}
        </main>

        {/* FOOTER - exactly matching VendorDashboard */}
        <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
      </div>
      
      {isProductModalOpen && formStep === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left">
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Create New Product</h2>
                <p className="text-[11px] text-slate-500">Step 1 of 4 · <span className="font-bold text-[#125852] capitalize">{businessCategory}</span></p>
              </div>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={1} />
            <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
              <ErrorBanner msg={errors._server} />
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. Premium Wireless Headphones" autoComplete="off"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.title && <p className="text-red-500 text-[9px] font-bold">{errors.title}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Sub-category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                    placeholder="0.00" min="0" step="any" autoComplete="off"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${errors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {errors.price && <p className="text-red-500 text-[9px] font-bold">{errors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                    placeholder="ALP-TSH-M-BLK-L-2026-0001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Quality</label>
                  <select name="qty" value={formData.qty} onChange={handleInputChange}
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
              <button type="button" onClick={closeCreateModal} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Cancel</button>
              <button
                type="button" onClick={handleStep1Continue}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${step1Valid ? 'bg-[#F5B841] text-white hover:bg-[#E0A83B] cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
              >
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && formStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]">
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Product Description</h2>
                <p className="text-[11px] text-slate-500">Step 2 of 4 · Tell customers what makes this product great</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={2} />
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <ErrorBanner msg={errors._server} />
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={2} onEdit={setFormStep} />
              {/* DescriptionField is a stable external component — typing works perfectly */}
              <DescriptionField value={formData.description} onChange={handleInputChange} error={errors.description} />
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={() => setFormStep(1)} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={handleStep2Continue} className="px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-[#F5B841] text-white hover:bg-[#E0A83B]">
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
      {isProductModalOpen && formStep === 3 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]">
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Sizes & Colors</h2>
                <p className="text-[11px] text-slate-500">Step 3 of 4 · Add product variants (optional)</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={3} />
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={3} onEdit={setFormStep} />
              <VariantSection sizes={formData.sizes} colors={formData.colors} onToggleChip={toggleChip} />
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={() => setFormStep(2)} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={handleStep3Continue} className="px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-[#F5B841] text-white hover:bg-[#E0A83B]">
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && formStep === 4 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handlePublish} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]">
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Images & Publish</h2>
                <p className="text-[11px] text-slate-500">Step 4 of 4 · Upload photos and go live</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={4} />
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <ErrorBanner msg={errors._server} />
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={4} onEdit={setFormStep} />

              {/* General images */}
              <ImageGrid
                existingImages={[]}
                pendingImages={formData.imageFiles}
                onRemoveExisting={() => {}}
                onRemovePending={removeCreateImage}
                onAdd={() => fileInputRef.current?.click()}
              />
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFilesChange} />

              {/* Color images */}
              {formData.colors.length > 0 && (
                <ColorImageSection
                  colors={formData.colors}
                  colorImageFiles={formData.colorImageFiles}
                  fileRefs={colorFileInputRefs}
                  onAdd={(color) => colorFileInputRefs.current[color]?.click()}
                  onChange={handleColorFilesChange}
                  onRemove={removeColorCreateImage}
                  onPreview={(color, images) => setColorPreviewModal({ color, images })}
                />
              )}

              {/* Publish toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Publish immediately</p>
                  <p className="text-[9px] text-slate-400">Toggle off to save as a draft</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPublished ? 'bg-[#125852]' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isPublished ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={() => setFormStep(3)} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#FABB00] text-white hover:bg-[#FABBO0] cursor-pointer'}`}
              >
                {isLoading ? 'Publishing…' : (isPublished ? ' Publish Product' : ' Save as Draft')}
              </button>
            </div>
          </form>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleUpdate} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]">
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Edit Product</h2>
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{selectedProduct.title}</p>
              </div>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); }} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
              <ErrorBanner msg={editErrors._server} />

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Title *</label>
                <input type="text" value={selectedProduct.title} onChange={(e) => setSelectedProduct((p) => ({ ...p, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {editErrors.title && <p className="text-red-500 text-[9px] font-bold">{editErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input type="number" value={selectedProduct.price} onChange={(e) => setSelectedProduct((p) => ({ ...p, price: e.target.value }))} min="0" step="any"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${editErrors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {editErrors.price && <p className="text-red-500 text-[9px] font-bold">{editErrors.price}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">SKU</label>
                  <input type="text" value={selectedProduct.sku || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Quality</label>
                  <select value={selectedProduct.qty || 'Medium'} onChange={(e) => setSelectedProduct((p) => ({ ...p, qty: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Location</label>
                  <input type="text" value={selectedProduct.location || ''} onChange={(e) => setSelectedProduct((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              {/* Description in edit — also using the external DescriptionField */}
              <DescriptionField
                value={selectedProduct.description || ''}
                onChange={(e) => {
                  setSelectedProduct((p) => ({ ...p, description: e.target.value }));
                  if (editErrors.description) setEditErrors((prev) => ({ ...prev, description: null }));
                }}
                error={editErrors.description}
              />

              <VariantSection sizes={selectedProduct.sizes || []} colors={selectedProduct.colors || []} onToggleChip={toggleEditChip} />

              <ImageGrid
                existingImages={selectedProduct.images || []}
                pendingImages={selectedProduct.newImageFiles || []}
                onRemoveExisting={handleDeleteExistingImage}
                onRemovePending={removeNewEditImage}
                onAdd={() => editFileInputRef.current?.click()}
              />
              <input ref={editFileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleEditFilesChange} />

              {(selectedProduct.colors || []).length > 0 && (
                <ColorImageSection
                  colors={selectedProduct.colors || []}
                  colorImageFiles={selectedProduct.colorImageFiles || {}}
                  fileRefs={editColorFileInputRefs}
                  onAdd={(color) => editColorFileInputRefs.current[color]?.click()}
                  onChange={handleEditColorFilesChange}
                  onRemove={removeEditColorImage}
                  onPreview={(color, images) => setColorPreviewModal({ color, images })}
                />
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Published</p>
                  <p className="text-[9px] text-slate-400">Toggle to publish or save as draft</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct((p) => ({ ...p, is_published: !p.is_published }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${selectedProduct.is_published ? 'bg-[#125852]' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${selectedProduct.is_published ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={handleDelete} className="px-4 py-2.5 text-[11px] font-bold border border-red-200 text-red-500 rounded-lg bg-white hover:bg-red-50 flex items-center gap-1.5">
                <Trash2 size={12} /> Delete
              </button>
              <button type="submit" disabled={isLoading}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#FABB00] text-white hover:bg-[#FABBO0]'}`}
              >
                {isLoading ? 'Saving…' : ' Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Delete Product?</h3>
            <p className="text-[11px] text-slate-500 mb-5">
              "<span className="font-bold text-slate-700">{selectedProduct?.title}</span>" will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {colorPreviewModal && (
        <ColorImagePreviewModal
          color={colorPreviewModal.color}
          images={colorPreviewModal.images}
          onClose={() => setColorPreviewModal(null)}
        />
      )}
    </div>
  );
};

export default ProductDashboard;