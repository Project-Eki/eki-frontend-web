import React, { useState, useEffect, useRef } from 'react';
import {
  X, ArrowRight, ArrowLeft, Eye, CheckCircle2, Palette, Ruler,
  ImagePlus, Trash2, ShoppingBag, ChevronDown, ChevronUp, Camera, Save,
} from 'lucide-react';
import { getImageUrl } from '../services/authService';

// Constants
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
const MAX_IMAGES_PER_COLOR = 3;
const MAX_GENERAL_IMAGES = 6;
const DESC_MIN_WORDS = 5;
const DESC_MAX_WORDS = 21;
const DISCOUNT_MIN = 3;
const DISCOUNT_MAX = 50;

const countWords = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getCategoryName = (category) => {
  if (!category) return '';
  if (typeof category === 'object' && category !== null) {
    return category.name || category.slug || '';
  }
  return String(category);
};

export const blankForm = () => ({
  title: '',
  price: '',
  sku: '',
  description: '',
  stock: 0,
  imageFiles: [],
  sizes: [],
  colors: [],
  colorImageFiles: {},
  discountEnabled: false,
  discountPercentage: 10,
});

export const isStep1Valid = (data) =>
  data.title?.trim().length > 0 &&
  data.price &&
  !isNaN(Number(data.price)) &&
  Number(data.price) > 0;

// ─── Resolve image ID from whatever shape the API returns ─────────────────────
const resolveImageId = (imgObj) => {
  if (!imgObj) return null;
  return imgObj.id ?? imgObj.image_id ?? imgObj.pk ?? null;
};

// ─── Camera Capture Component ─────────────────────────────────────────────────
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isSecureContext =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      setError(
        'Camera access requires HTTPS. Your site is currently on HTTP. ' +
        'Please configure SSL on your server, or use the file upload option instead.'
      );
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Your browser does not support camera access. Please use file upload instead.');
      return;
    }

    let activeStream = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device. Please use file upload instead.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application. Please close other apps and try again.');
        } else {
          setError(`Camera error: ${err.message}. Please use file upload instead.`);
        }
      }
    };

    startCamera();
    return () => { if (activeStream) activeStream.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="relative w-full max-w-lg">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
          <X size={20} />
        </button>
        {error ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Camera size={24} className="text-red-500" />
            </div>
            <p className="text-sm font-bold text-slate-800">Camera unavailable</p>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-[#F5B841] text-white rounded-xl text-sm font-bold hover:bg-[#E0A83B] transition-colors">
              Use file upload instead
            </button>
          </div>
        ) : (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl bg-black" style={{ maxHeight: '70vh' }} />
            <canvas ref={canvasRef} className="hidden" />
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                <p className="text-white text-sm font-medium">Starting camera…</p>
              </div>
            )}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
              <button onClick={onClose} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold hover:bg-white/30 transition-colors">Cancel</button>
              <button
                onClick={handleCapture}
                disabled={!isReady}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform ${isReady ? 'bg-white hover:scale-105 active:scale-95' : 'bg-white/50 cursor-not-allowed'}`}
              >
                <div className={`w-14 h-14 rounded-full border-2 border-white ${isReady ? 'bg-[#F5B841]' : 'bg-slate-300'}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── StepProgressBar ──────────────────────────────────────────────────────────
const StepProgressBar = ({ currentStep, labels = ['Basic Info', 'Description', 'Variants', 'Images'] }) => (
  <div className="px-6 pt-3 pb-2 flex-shrink-0">
    <div className="flex items-center gap-1.5">
      {labels.map((label, idx) => {
        const step = idx + 1;
        const done = step < currentStep;
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

// ─── DescriptionField ─────────────────────────────────────────────────────────
const DescriptionField = ({ value, onChange, error }) => {
  const words = countWords(value);
  const tooShort = value && value.trim() && words < DESC_MIN_WORDS;
  const tooLong = DESC_MAX_WORDS && words > DESC_MAX_WORDS;
  const valid = value && value.trim() && words >= DESC_MIN_WORDS && (!DESC_MAX_WORDS || words <= DESC_MAX_WORDS);
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

// ─── VariantSection ───────────────────────────────────────────────────────────
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
                sizes.includes(size) ? 'bg-[#125852] text-white border-[#125852]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#125852] hover:text-[#125852]'
              }`}
            >
              {size === 'one_size' ? 'One Size' : size}
            </button>
          ))}
        </div>
        {sizes.length > 0 && <p className="text-[10px] text-[#125852] font-medium">Selected: {sizes.join(', ')}</p>}
      </div>

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

// ─── ImageGrid ────────────────────────────────────────────────────────────────
const ImageGrid = ({ existingImages = [], pendingImages = [], onRemoveExisting, onRemovePending, onAdd, onCameraCapture }) => {
  const total = existingImages.length + pendingImages.length;
  const canAddMore = total < MAX_GENERAL_IMAGES;
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowCameraOptions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveExisting = async (imgObj, index) => {
    const imageId = resolveImageId(imgObj);
    const spinnerKey = imageId ?? index;
    setDeletingId(spinnerKey);
    try {
      await onRemoveExisting(imageId, index);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase text-slate-500">General Product Images</label>
        <span className="text-[9px] text-slate-400">{total}/{MAX_GENERAL_IMAGES}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {existingImages.map((img, i) => {
          const imageId = resolveImageId(img);
          const spinnerKey = imageId ?? i;
          const isDeleting = deletingId === spinnerKey;
          return (
            <div key={spinnerKey} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative group flex-shrink-0">
              {isDeleting ? (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <svg className="animate-spin w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : (
                <img src={getImageUrl(img.image)} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              )}
              {i === 0 && !isDeleting && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#125852]/80 text-white text-[7px] font-black text-center py-0.5">MAIN</span>
              )}
              {!isDeleting && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(img, i)}
                  className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Delete this image"
                >
                  <Trash2 size={9} />
                </button>
              )}
            </div>
          );
        })}
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
          <div className="relative" ref={optionsRef}>
            <button
              type="button"
              onClick={() => setShowCameraOptions(!showCameraOptions)}
              className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0"
            >
              <ImagePlus size={16} className="text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 mt-1">ADD</span>
            </button>
            {showCameraOptions && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => { onAdd(); setShowCameraOptions(false); }}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
                >
                  <ImagePlus size={12} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => { onCameraCapture(); setShowCameraOptions(false); }}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
                >
                  <Camera size={12} /> Take Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB · up to {MAX_GENERAL_IMAGES} images · first is main photo</p>
    </div>
  );
};

// ─── ColorImageSection ────────────────────────────────────────────────────────
const ColorImageSection = ({
  colors, colorImageFiles,
  fileRefs, onAdd, onChange, onRemove, onPreview, onCameraCapture,
}) => {
  const [showCameraForColor, setShowCameraForColor] = useState(null);
  const optionsRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideAny = Object.values(optionsRefs.current).some(
        (ref) => ref && ref.contains(e.target)
      );
      if (!clickedInsideAny) setShowCameraForColor(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
      <div className="flex items-center gap-2">
        <Palette size={13} className="text-[#125852]" />
        <h4 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Images Per Color Variant</h4>
        <span className="text-[9px] text-slate-400 ml-auto">Up to {MAX_IMAGES_PER_COLOR} per colour</span>
      </div>
      {colors.map((color) => {
        const images = colorImageFiles?.[color] || [];
        const canAdd = images.length < MAX_IMAGES_PER_COLOR;
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
                  <span
                    className="absolute bottom-0 left-0 right-0 text-center text-[6px] font-black py-0.5 truncate px-1"
                    style={{ backgroundColor: (COLOR_SWATCHES[color] || '#125852') + 'cc', color: '#fff' }}
                  >
                    {color.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(color, i)}
                    className="absolute top-0.5 right-0.5 bg-white/90 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={7} />
                  </button>
                </div>
              ))}
              {canAdd && (
                <div className="relative" ref={(el) => { optionsRefs.current[color] = el; }}>
                  <button
                    type="button"
                    onClick={() => setShowCameraForColor(showCameraForColor === color ? null : color)}
                    className="w-14 h-14 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors flex-shrink-0"
                  >
                    <ImagePlus size={13} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-400 mt-0.5">ADD</span>
                  </button>
                  {showCameraForColor === color && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1 min-w-[110px]">
                      <button
                        type="button"
                        onClick={() => { onAdd(color); setShowCameraForColor(null); }}
                        className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <ImagePlus size={12} /> Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => { onCameraCapture(color); setShowCameraForColor(null); }}
                        className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <Camera size={12} /> Take Photo
                      </button>
                    </div>
                  )}
                </div>
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

// ─── Color Image Preview Modal ────────────────────────────────────────────────
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
                <ArrowLeft size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center transition-all">
                <ArrowRight size={16} className="text-slate-700" />
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
                <button
                  key={i} type="button" onClick={() => setCurrentIndex(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-[#125852] shadow-md' : 'border-transparent opacity-60 hover:opacity-90'}`}
                >
                  {src
                    ? <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><ShoppingBag size={14} className="text-slate-400" /></div>
                  }
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SummaryPill 
const SummaryPill = ({ formData, currencySymbol, currentStep, onEdit }) => {
  const displayPrice = formData.discountEnabled && formData.price
    ? Number(formData.price) * (1 - formData.discountPercentage / 100)
    : Number(formData.price || 0);

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Summary</p>
          <p className="text-[13px] font-bold text-slate-800 truncate">{formData.title || 'New Product'}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {formData.discountEnabled && formData.price ? (
              <>
                <span className="text-[10px] text-slate-400 line-through">{currencySymbol} {Number(formData.price).toLocaleString()}</span>
                <span className="text-[11px] text-[#125852] font-bold">{currencySymbol} {displayPrice.toLocaleString()}</span>
                <span className="text-[8px] bg-[#F5B841] text-white px-1.5 py-0.5 rounded-full font-bold">-{formData.discountPercentage}%</span>
              </>
            ) : (
              <span className="text-[11px] text-[#125852] font-bold">{currencySymbol} {Number(formData.price || 0).toLocaleString()}</span>
            )}
            {formData.stock > 0 && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Qty: {formData.stock}</span>}
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
};

// ─── Edit Mode Save Banner ────────────────────────────────────────────────────
const EditSaveBanner = ({ onSave, isLoading, label = 'Save Changes' }) => (
  <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between flex-shrink-0">
    <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1.5">
      <Save size={11} />
      Editing existing product — save at any step
    </p>
    <button
      type="button"
      onClick={onSave}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm transition-all active:scale-95 ${
        isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#125852] text-white hover:bg-[#0e4340] cursor-pointer'
      }`}
    >
      <Save size={11} />
      {isLoading ? 'Saving…' : label}
    </button>
  </div>
);

// ─── Main Listing Form Component ──────────────────────────────────────────────
const ProductListing = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isServiceVendor = false,
  businessCategory = 'retail',
  currencySymbol = 'UGX',
  initialData = null,
  submitLabel = 'Publish Product',
  branchLocation = '',
  listingId = null,
  onDeleteImage,
}) => {
  const isEditMode = !!initialData;

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState(blankForm());
  const [formErrors, setFormErrors] = useState({});
  const [isPublished, setIsPublished] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [colorPreviewModal, setColorPreviewModal] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTargetColor, setCameraTargetColor] = useState(null);
  const fileInputRef = useRef(null);
  const colorFileInputRefs = useRef({});

  const step1Valid = isStep1Valid(formData);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        price: initialData.price ? String(initialData.price) : '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        stock: initialData.stock ?? initialData.detail?.stock ?? initialData.stock_quantity ?? 0,
        imageFiles: [],
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        colorImageFiles: {},
        discountEnabled: initialData.discount_enabled || false,
        discountPercentage: initialData.discount_percentage || 10,
      });
      setExistingImages(initialData.images || []);
      setIsPublished(initialData.is_published === true);
    } else {
      setFormData({ ...blankForm(), discountPercentage: 10 });
      setExistingImages([]);
      setIsPublished(true);
    }
    setFormStep(1);
    setFormErrors({});
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: null }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_GENERAL_IMAGES - existingImages.length - formData.imageFiles.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          imageFiles: [...prev.imageFiles, { preview: reader.result, file }],
        }));
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraCapture = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (cameraTargetColor) {
        setFormData((prev) => ({
          ...prev,
          colorImageFiles: {
            ...prev.colorImageFiles,
            [cameraTargetColor]: [
              ...(prev.colorImageFiles[cameraTargetColor] || []),
              { preview: reader.result, file },
            ],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          imageFiles: [...prev.imageFiles, { preview: reader.result, file }],
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeCreateImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));

  const handleRemoveExistingImage = async (imageId, index) => {
    if (onDeleteImage) {
      await onDeleteImage(listingId, imageId);
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorFilesChange = (color, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES_PER_COLOR - (formData.colorImageFiles[color] || []).length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          colorImageFiles: {
            ...prev.colorImageFiles,
            [color]: [...(prev.colorImageFiles[color] || []), { preview: reader.result, file }],
          },
        }));
      reader.readAsDataURL(file);
    });
    if (colorFileInputRefs.current[color]) colorFileInputRefs.current[color].value = '';
  };

  const removeColorCreateImage = (color, index) =>
    setFormData((prev) => ({
      ...prev,
      colorImageFiles: {
        ...prev.colorImageFiles,
        [color]: (prev.colorImageFiles[color] || []).filter((_, i) => i !== index),
      },
    }));

  const toggleChip = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      if (field === 'colors' && arr.includes(value)) {
        const { [value]: _removed, ...rest } = prev.colorImageFiles || {};
        return { ...prev, [field]: next, colorImageFiles: rest };
      }
      return { ...prev, [field]: next };
    });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errs.price = 'Valid price is required';
    }
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    const wordCount = countWords(formData.description);
    if (formData.description && formData.description.trim()) {
      if (wordCount < DESC_MIN_WORDS) {
        errs.description = `Too short (${wordCount} word${wordCount !== 1 ? 's' : ''}). Min ${DESC_MIN_WORDS} words.`;
      } else if (DESC_MAX_WORDS && wordCount > DESC_MAX_WORDS) {
        errs.description = `Too long (${wordCount} words). Max ${DESC_MAX_WORDS} words.`;
      }
    }
    return errs;
  };

  const handleStep1Continue = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setFormStep(2);
  };

  const handleStep2Continue = () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setFormStep(3);
  };

  const handleStep3Continue = () => {
    setFormErrors({});
    setFormStep(4);
  };

  const collectAllFiles = () => {
    const general = (formData.imageFiles || []).map((f) => f.file);
    const colored = Object.values(formData.colorImageFiles || {}).flat().map((f) => f.file);
    return [...general, ...colored];
  };

  const buildPayloadAndSubmit = async () => {
    const validationErrors = validateStep1();
    const descErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0 || Object.keys(descErrors).length > 0) {
      setFormErrors({ ...validationErrors, ...descErrors });
      if (Object.keys(validationErrors).length > 0) setFormStep(1);
      else setFormStep(2);
      return;
    }

    const discountedPrice = formData.discountEnabled && formData.price
      ? parseFloat(formData.price) * (1 - formData.discountPercentage / 100)
      : null;

    const payload = {
      title: formData.title,
      description: formData.description,
      branch_location: branchLocation || '',
      price: parseFloat(formData.price) || 0,
      sku: formData.sku,
      stock: parseInt(formData.stock) || 0,
      sizes: formData.sizes,
      colors: formData.colors,
      is_published: isPublished,
      business_category: businessCategory,
      sales_status: formData.discountEnabled
        ? { on_sale: true, discount_percentage: formData.discountPercentage, discounted_price: discountedPrice }
        : { on_sale: false },
    };

    const allFiles = collectAllFiles();

    try {
      await onSubmit(payload, allFiles);
    } catch (err) {
      setFormErrors({ _server: err.message || 'Something went wrong. Please try again.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await buildPayloadAndSubmit();
  };

  const handleEditSave = async () => {
    await buildPayloadAndSubmit();
  };

  const ErrorBanner = ({ msg }) =>
    msg ? (
      <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-3 py-2 rounded-lg">
        {msg}
      </div>
    ) : null;

  if (!isOpen) return null;

  const modalWrap = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4';
  const modalBox = 'bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col text-left max-h-[92vh]';

  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => { setShowCamera(false); setCameraTargetColor(null); }}
        />
      )}

      {/* Step 1 */}
      {formStep === 1 && (
        <div className={modalWrap}>
          <div className={modalBox} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">{initialData ? 'Edit' : 'Create New'} {isServiceVendor ? 'Service' : 'Product'}</h2>
                <p className="text-[11px] text-slate-500">Step 1 of 4 · <span className="font-bold text-[#125852] capitalize">{businessCategory}</span></p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={1} />
            {isEditMode && <EditSaveBanner onSave={handleEditSave} isLoading={isLoading} label={submitLabel} />}

            <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
              <ErrorBanner msg={formErrors._server} />
              {branchLocation && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Branch Location</span>
                  <span className="text-[11px] font-bold text-[#125852] ml-auto">{branchLocation}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input
                  type="text" name="title" value={formData.title}
                  onChange={handleInputChange}
                  placeholder={`e.g. ${isServiceVendor ? 'Website Design Package' : 'Premium Wireless Headphones'}`}
                  autoComplete="off"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
                {formErrors.title && <p className="text-red-500 text-[9px] font-bold">{formErrors.title}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input
                    type="number" name="price" value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00" min="0" step="any" autoComplete="off"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.price ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {formErrors.price && <p className="text-red-500 text-[9px] font-bold">{formErrors.price}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                  <input
                    type="text" name="sku" value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="ALP-TSH-M-BLK-2026-001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Stock Quantity</label>
                <input
                  type="number" name="stock" value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="e.g. 10" min="0" step="1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              <div className="space-y-3 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-slate-600">Apply Discount</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountEnabled: !prev.discountEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.discountEnabled ? 'bg-[#125852]' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.discountEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {formData.discountEnabled && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500">
                        Discount: <span className="text-[#125852]">{formData.discountPercentage}% OFF</span>
                      </label>
                      <span className="text-[10px] text-slate-400">{DISCOUNT_MIN}% – {DISCOUNT_MAX}%</span>
                    </div>
                    <input
                      type="range" min={DISCOUNT_MIN} max={DISCOUNT_MAX} step="1"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F5B841]"
                    />
                    {formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Price Preview</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400 line-through">{currencySymbol} {Number(formData.price).toLocaleString()}</span>
                          <span className="text-lg font-black text-[#125852]">
                            {currencySymbol} {(Number(formData.price) * (1 - formData.discountPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-[#F5B841] px-2 py-0.5 rounded-full">-{formData.discountPercentage}%</span>
                        </div>
                        <p className="text-[9px] text-emerald-600 font-medium mt-1">
                          Customer saves {currencySymbol} {(Number(formData.price) * (formData.discountPercentage / 100)).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {!formData.discountEnabled && (
                  <p className="text-[10px] text-slate-400 italic">Toggle on to apply a discount to this product</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={onClose} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Cancel</button>
              <button
                type="button" onClick={handleStep1Continue}
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                  step1Valid ? 'bg-[#F5B841] text-white hover:bg-[#E0A83B] cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isEditMode ? 'Next' : 'Continue'} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {formStep === 2 && (
        <div className={modalWrap}>
          <div className={modalBox} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Product Description</h2>
                <p className="text-[11px] text-slate-500">Step 2 of 4 · Tell customers what makes this product great</p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={2} />
            {isEditMode && <EditSaveBanner onSave={handleEditSave} isLoading={isLoading} label={submitLabel} />}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <ErrorBanner msg={formErrors._server} />
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={2} onEdit={setFormStep} />
              <DescriptionField value={formData.description} onChange={handleDescriptionChange} error={formErrors.description} />
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={() => setFormStep(1)} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={handleStep2Continue} className="px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-[#F5B841] text-white hover:bg-[#E0A83B]">
                {isEditMode ? 'Next' : 'Continue'} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {formStep === 3 && (
        <div className={modalWrap}>
          <div className={modalBox} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Sizes & Colors</h2>
                <p className="text-[11px] text-slate-500">Step 3 of 4 · Add product variants (optional)</p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={3} />
            {isEditMode && <EditSaveBanner onSave={handleEditSave} isLoading={isLoading} label={submitLabel} />}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <ErrorBanner msg={formErrors._server} />
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={3} onEdit={setFormStep} />
              <VariantSection sizes={formData.sizes} colors={formData.colors} onToggleChip={toggleChip} />
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/20 flex-shrink-0">
              <button type="button" onClick={() => setFormStep(2)} className="px-6 py-2.5 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back
              </button>
              <button type="button" onClick={handleStep3Continue} className="px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-[#F5B841] text-white hover:bg-[#E0A83B]">
                {isEditMode ? 'Next' : 'Continue'} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {formStep === 4 && (
        <div className={modalWrap}>
          <form onSubmit={handleSubmit} className={modalBox} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="px-6 py-4 border-b flex justify-between items-start flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Images & Publish</h2>
                <p className="text-[11px] text-slate-500">Step 4 of 4 · Upload photos and go live</p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <StepProgressBar currentStep={4} />
            {isEditMode && <EditSaveBanner onSave={handleEditSave} isLoading={isLoading} label={submitLabel} />}

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <ErrorBanner msg={formErrors._server} />
              <SummaryPill formData={formData} currencySymbol={currencySymbol} currentStep={4} onEdit={setFormStep} />

              <ImageGrid
                existingImages={existingImages}
                pendingImages={formData.imageFiles}
                onRemoveExisting={handleRemoveExistingImage}
                onRemovePending={removeCreateImage}
                onAdd={() => fileInputRef.current?.click()}
                onCameraCapture={() => { setCameraTargetColor(null); setShowCamera(true); }}
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFilesChange}
              />

              {formData.colors.length > 0 && (
                <ColorImageSection
                  colors={formData.colors}
                  colorImageFiles={formData.colorImageFiles}
                  fileRefs={colorFileInputRefs}
                  onAdd={(color) => colorFileInputRefs.current[color]?.click()}
                  onChange={handleColorFilesChange}
                  onRemove={removeColorCreateImage}
                  onPreview={(color, images) => setColorPreviewModal({ color, images })}
                  onCameraCapture={(color) => { setCameraTargetColor(color); setShowCamera(true); }}
                />
              )}

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
                className={`px-8 py-2.5 rounded-lg text-[11px] font-bold uppercase shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                  isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#FABB00] text-white hover:bg-[#E0A830] cursor-pointer'
                }`}
              >
                {isLoading ? 'Saving…' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      )}

      {colorPreviewModal && (
        <ColorImagePreviewModal
          color={colorPreviewModal.color}
          images={colorPreviewModal.images}
          onClose={() => setColorPreviewModal(null)}
        />
      )}
    </>
  );
};

export default ProductListing;