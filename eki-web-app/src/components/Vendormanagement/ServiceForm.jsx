import React, { useState } from 'react';
import { 
  Globe, 
  Hotel, 
  Plane, 
  MapPin, 
  DollarSign, 
  FileText, 
  Briefcase,
  CheckCircle2 
} from 'lucide-react';

const ServiceForm = () => {
  const [serviceType, setServiceType] = useState('');

  const categories = [
    { id: 'hotel', label: 'Hotels', icon: <Hotel size={24} />, color: 'teal' },
    { id: 'airplane', label: 'Airlines', icon: <Plane size={24} />, color: 'blue' },
    { id: 'professional', label: 'Services', icon: <Briefcase size={24} />, color: 'purple' },
  ];

  return (
    <div className="bg-white p-8 rounded-2xl max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create New Service</h3>
      
      <form className="space-y-6">
        {/* Service Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name</label>
          <div className="relative">
             <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
             <input type="text" placeholder="e.g. Serengeti Luxury Suite" className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50/50" />
          </div>
        </div>

        {/* ICON SELECTION GRID (Instead of Dropdown) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Category</label>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setServiceType(cat.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  serviceType === cat.id 
                  ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' 
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                {serviceType === cat.id && (
                  <CheckCircle2 className="absolute top-2 right-2 text-teal-600" size={16} />
                )}
                <div className={serviceType === cat.id ? 'text-teal-600' : 'text-gray-400'}>
                  {cat.icon}
                </div>
                <span className="text-xs font-bold mt-2 uppercase tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* HOTEL CONDITIONAL FIELDS */}
        {serviceType === 'hotel' && (
          <div className="p-6 bg-teal-50/50 border border-teal-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
            <h4 className="flex items-center gap-2 font-bold text-teal-800 text-sm italic">
              <Hotel size={18}/> HOTEL CONFIGURATION
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-teal-700 uppercase ml-1">Official Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-teal-400" size={16} />
                  <input type="url" placeholder="https://..." className="w-full pl-10 p-2.5 border border-teal-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-teal-700 uppercase ml-1">Physical Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-teal-400" size={16} />
                  <input type="text" placeholder="Street Address, City" className="w-full pl-10 p-2.5 border border-teal-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AIRPLANE CONDITIONAL FIELDS */}
        {serviceType === 'airplane' && (
          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
            <h4 className="flex items-center gap-2 font-bold text-blue-800 text-sm italic">
              <Plane size={18}/> FLIGHT SPECIFICATIONS
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-700 uppercase ml-1">Flight ID / Code</label>
                <input type="text" placeholder="e.g. UG-202" className="w-full p-2.5 border border-blue-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-700 uppercase ml-1">Operator Name</label>
                <input type="text" placeholder="Airline Name" className="w-full p-2.5 border border-blue-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-teal-600" size={18} />
            <input type="number" placeholder="0.00" className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <button type="submit" className="w-full bg-teal-700 text-white font-bold py-4 rounded-xl hover:bg-teal-800 transition-all shadow-lg shadow-teal-700/20 active:scale-[0.98]">
          Submit for Review
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;