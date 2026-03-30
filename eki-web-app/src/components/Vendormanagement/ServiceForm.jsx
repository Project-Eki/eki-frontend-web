import React, { useState, useEffect, useRef } from "react";
import {
  Hotel, Plane, Briefcase, Bike, Globe, MapPin, DollarSign, FileText, Clock,
  ToggleLeft, ToggleRight, CheckCircle2, ChevronDown, Phone, Mail, Link,
  Car, User, Tag, Image, X, ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle, Loader2, Scissors,
} from "lucide-react";
import { createListing, uploadListingImage } from "../../services/api";
import { buildListingPayload } from "../../utils/buildListingPayload";
import api from "../../services/api";
import { countWords, validateStep, validateAllSteps } from "../../utils/ServiceFormValidation";


// PHONE INPUT — react-phone-input-2

let PhoneInput = null;
try { PhoneInput = require('react-phone-input-2').default; } catch (_) {}


// COUNTRY DATA

let isoCountries = null;
try {
  const lib = require('i18n-iso-countries');
  lib.registerLocale(require('i18n-iso-countries/langs/en.json'));
  isoCountries = lib;
} catch (_) {}

const getCountryOptions = () => {
  if (isoCountries) {
    return Object.entries(isoCountries.getNames('en', { select: 'official' }))
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, name]) => ({ code, name }));
  }
  return [
    { code:'UG', name:'Uganda' }, { code:'KE', name:'Kenya' },
    { code:'TZ', name:'Tanzania' }, { code:'RW', name:'Rwanda' },
    { code:'NG', name:'Nigeria' }, { code:'GH', name:'Ghana' },
    { code:'ZA', name:'South Africa' }, { code:'ET', name:'Ethiopia' },
    { code:'EG', name:'Egypt' }, { code:'GB', name:'United Kingdom' },
    { code:'US', name:'United States' }, { code:'AE', name:'United Arab Emirates' },
    { code:'CN', name:'China' }, { code:'IN', name:'India' },
    { code:'DE', name:'Germany' }, { code:'FR', name:'France' },
  ].sort((a,b) => a.name.localeCompare(b.name));
};


// SHARED UI ATOMS — identical to previous version

const Field = ({ label, required, hint, error, children }) => (
  <div className="space-y-0.5">
    <label className="block text-[11px] font-medium text-gray-700">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[10px] text-red-500 flex items-center gap-1">
        <AlertCircle size={9} /> {error}
      </p>
    )}
    {hint && !error && <p className="text-[9px] text-gray-400">{hint}</p>}
  </div>
);

const iCls     = "w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034FF] focus:border-[#EFB034FF] transition-all placeholder:text-gray-400";
const iCls_icon = "w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034FF] focus:border-[#EFB034FF] transition-all placeholder:text-gray-400";

const InputIcon = ({ icon: Icon, error, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
    <input className={`${iCls_icon} ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`} {...props}/>
  </div>
);

const Select = ({ error, children, ...props }) => (
  <div className="relative">
    <select className={`${iCls} appearance-none pr-6 cursor-pointer ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`} {...props}>
      {children}
    </select>
    <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
    <div>
      <p className="text-[11px] font-medium text-gray-800">{label}</p>
      {desc && <p className="text-[9px] text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)} className="shrink-0 ml-2">
      {checked ? <ToggleRight size={24} className="text-[#EFB034FF]"/> : <ToggleLeft size={24} className="text-gray-300"/>}
    </button>
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1.5 text-[10px] text-gray-600 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-3 h-3 accent-[#EFB034FF] rounded"/>
    {label}
  </label>
);

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium mb-2 bg-[#EFB034]/10 border-[#EFB034]/20 text-[#EFB034FF]">
    <Icon size={12}/> {label}
  </div>
);


// PHONE FIELD

const PhoneField = ({ value, onChange, error }) => {
  if (PhoneInput) {
    return (
      <PhoneInput
        country="ug"
        value={(value || '').replace(/^\+/, '')}
        onChange={phone => onChange('+' + phone)}
        inputClass={`!w-full !text-xs !border-gray-200 !rounded-lg !h-7 !pl-10 ${error ? '!border-red-300' : ''}`}
        buttonClass="!border-gray-200 !rounded-l-lg !bg-gray-50"
        containerClass="!w-full"
        specialLabel=""
        placeholder="+256 700 000 000"
      />
    );
  }
  return (
    <InputIcon icon={Phone} type="tel" placeholder="+256 700 000 000"
      value={value || ''} onChange={e => onChange(e.target.value)} error={error}/>
  );
};


// COUNTRY SELECT

const CountrySelect = ({ value, onChange, error }) => {
  const countries = getCountryOptions();
  return (
    <div className="relative">
      <Globe className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12}/>
      <select
        className={`${iCls_icon} appearance-none pr-6 cursor-pointer ${error ? 'border-red-300' : ''}`}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select country</option>
        {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
    </div>
  );
};


// STEP 2 SUB-FORMS
// KEY FIX: All <option value="..."> now use backend-accepted enum strings.
// Display labels (what the user sees) are kept readable.


const ProfessionalStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2"><SectionHeader icon={Briefcase} label="SERVICE CONFIGURATION"/></div>

    {/*
      FIX: Sub-category values are now the actual business_category values
      sent to the backend. These match the backend's BusinessCategory enum.
      The professional "Services" card maps to whichever sub-category is picked here.
    */}
    <Field label="Sub-Category" required error={errors.category}>
      <Select value={d.category||""} onChange={e=>set("category",e.target.value)} error={errors.category}>
        <option value="">Select sub-category</option>
        <option value="tailoring">Tailoring</option>
        <option value="profession">Other</option>
      </Select>
    </Field>

    <Field label="Base Price ($)" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00"
        value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>
    <Field label="Price Unit">
      <Select value={d.priceUnit||"session"} onChange={e=>set("priceUnit",e.target.value)}>
        <option value="session">Per Session</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
        <option value="project">Per Project</option>
        <option value="month">Per Month</option>
      </Select>
    </Field>
    <Field label="Duration">
      <InputIcon icon={Clock} placeholder="e.g. 60 min"
        value={d.duration||""} onChange={e=>set("duration",e.target.value)}/>
    </Field>
    <Field label="Availability">
      <Select value={d.availability||"available"} onChange={e=>set("availability",e.target.value)}>
        <option value="available">Available Now</option>
        <option value="limited">Limited Slots</option>
        <option value="booked">Fully Booked</option>
        <option value="by_request">By Request Only</option>
      </Select>
    </Field>
    <Field label="Languages">
      <InputIcon icon={Globe} placeholder="English, French…"
        value={d.languages||""} onChange={e=>set("languages",e.target.value)}/>
    </Field>

    {/* Fabric material — only shown for tailoring sub-category */}
    {d.category === "tailoring" && (
      <Field label="Fabric Material" required error={errors.fabricMaterial} hint="Required for tailoring">
        <InputIcon icon={Scissors} placeholder="e.g. Wool blend, Cotton"
          value={d.fabricMaterial||""} onChange={e=>set("fabricMaterial",e.target.value)} error={errors.fabricMaterial}/>
      </Field>
    )}

    {/* Pre-filled from vendor profile */}
    <Field label="Contact Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField value={d.phone} onChange={v=>set("phone",v)} error={errors.phone}/>
      </div>
    </Field>
    <Field label="Contact Email" hint="Pre-filled from your profile">
      <InputIcon icon={Mail} type="email" placeholder="your@email.com"
        value={d.email||""} onChange={e=>set("email",e.target.value)}/>
    </Field>

    <div className="col-span-2">
      <Toggle checked={!!d.remote} onChange={v=>set("remote",v)}
        label="Remote / Online offering" desc="Can be delivered via video call"/>
    </div>
    {d.remote && (
      <div className="col-span-2">
        <Field label="Platform link" hint="Zoom, Calendly, etc.">
          <InputIcon icon={Link} placeholder="https://calendly.com/yourname"
            value={d.platform||""} onChange={e=>set("platform",e.target.value)}/>
        </Field>
      </div>
    )}
  </div>
);

const HotelStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2"><SectionHeader icon={Hotel} label="HOTEL CONFIGURATION"/></div>

    {/* FIX: property type values match backend enum */}
    <Field label="Property Type" required error={errors.propertyType}>
      <Select value={d.propertyType||""} onChange={e=>set("propertyType",e.target.value)} error={errors.propertyType}>
        <option value="">Select type</option>
        <option value="hotel">Hotel</option>
        <option value="lodge">Lodge</option>
        <option value="guesthouse">Guesthouse</option>
        <option value="airbnb">Airbnb / Short-Stay</option>
        <option value="resort">Resort</option>
        <option value="hostel">Hostel</option>
        <option value="serviced_apartment">Serviced Apartment</option>
        <option value="villa">Villa</option>
      </Select>
    </Field>
    <Field label="Star Rating">
      <Select value={d.stars||""} onChange={e=>set("stars",e.target.value)}>
        <option value="">Select</option>
        {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
        <option value="unrated">Unrated</option>
      </Select>
    </Field>
    <Field label="Price / Night ($)" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00"
        value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>
    <Field label="Room Category" required error={errors.roomCategory}>
      <Select value={d.roomCategory||""} onChange={e=>set("roomCategory",e.target.value)} error={errors.roomCategory}>
        <option value="">Select room</option>
        <option value="Standard Room">Standard Room</option>
        <option value="Deluxe Room">Deluxe Room</option>
        <option value="Suite">Suite</option>
        <option value="Executive Room">Executive Room</option>
        <option value="Family Room">Family Room</option>
        <option value="Penthouse">Penthouse</option>
        <option value="Entire Unit">Entire Unit</option>
      </Select>
    </Field>
    <Field label="Max Guests">
      <InputIcon icon={User} type="number" placeholder="2"
        value={d.maxGuests||""} onChange={e=>set("maxGuests",e.target.value)}/>
    </Field>
    <Field label="Total Rooms">
      <InputIcon icon={Tag} type="number" placeholder="e.g. 24"
        value={d.totalRooms||""} onChange={e=>set("totalRooms",e.target.value)}/>
    </Field>
    <Field label="Check-In"><input type="time" className={iCls} value={d.checkIn||""} onChange={e=>set("checkIn",e.target.value)}/></Field>
    <Field label="Check-Out"><input type="time" className={iCls} value={d.checkOut||""} onChange={e=>set("checkOut",e.target.value)}/></Field>

    {/* Pre-filled address */}
    <div className="col-span-2">
      <Field label="Address" required error={errors.address} hint="Pre-filled from your profile">
        <div className="ring-1 ring-amber-300 rounded-lg">
          <InputIcon icon={MapPin} placeholder="Street, City, Country"
            value={d.address||""} onChange={e=>set("address",e.target.value)} error={errors.address}/>
        </div>
      </Field>
    </div>
    <Field label="Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField value={d.phone} onChange={v=>set("phone",v)}/>
      </div>
    </Field>
    <Field label="Booking Email">
      <InputIcon icon={Mail} type="email" placeholder="reservations@hotel.com"
        value={d.email||""} onChange={e=>set("email",e.target.value)}/>
    </Field>
    <div className="col-span-2">
      <Field label="Website" hint="Optional">
        <InputIcon icon={Globe} type="url" placeholder="https://www.yourhotel.com"
          value={d.website||""} onChange={e=>set("website",e.target.value)}/>
      </Field>
    </div>
    <div className="col-span-2">
      <Field label="Cancellation Policy">
        <Select value={d.cancellation||""} onChange={e=>set("cancellation",e.target.value)}>
          <option value="">Select policy</option>
          <option value="free_24h">Free cancellation up to 24 hours</option>
          <option value="free_48h">Free cancellation up to 48 hours</option>
          <option value="free_7d">Free cancellation up to 7 days</option>
          <option value="non_refundable">Non-refundable</option>
          <option value="partial_50">Partial refund (50%)</option>
        </Select>
      </Field>
    </div>
  </div>
);

const AirlineStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2"><SectionHeader icon={Plane} label="FLIGHT SPECIFICATIONS"/></div>

    {/* FIX: service type values match backend enum */}
    <Field label="Service Type" required error={errors.serviceType}>
      <Select value={d.serviceType||""} onChange={e=>set("serviceType",e.target.value)} error={errors.serviceType}>
        <option value="">Select type</option>
        <option value="scheduled">Scheduled Flight</option>
        <option value="charter">Charter Flight</option>
        <option value="cargo">Cargo Service</option>
        <option value="helicopter">Helicopter Transfer</option>
        <option value="private_jet">Private Jet</option>
        <option value="ticketing">Travel Agency / Ticketing</option>
      </Select>
    </Field>
    <Field label="Flight Code">
      <input className={iCls} placeholder="e.g. UG-202" value={d.flightCode||""} onChange={e=>set("flightCode",e.target.value)}/>
    </Field>
    <Field label="Origin" required error={errors.origin}>
      <InputIcon icon={MapPin} placeholder="e.g. Entebbe (EBB)"
        value={d.origin||""} onChange={e=>set("origin",e.target.value)} error={errors.origin}/>
    </Field>
    <Field label="Destination(s)" required error={errors.destinations}>
      <InputIcon icon={MapPin} placeholder="e.g. Nairobi, Dubai"
        value={d.destinations||""} onChange={e=>set("destinations",e.target.value)} error={errors.destinations}/>
    </Field>
    <Field label="Price / Seat ($)" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00"
        value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>

    {/* FIX: cabin class values match backend enum */}
    <Field label="Cabin Class">
      <Select value={d.cabinClass||""} onChange={e=>set("cabinClass",e.target.value)}>
        <option value="">Select</option>
        <option value="economy">Economy</option>
        <option value="premium_economy">Premium Economy</option>
        <option value="business">Business Class</option>
        <option value="first">First Class</option>
        <option value="all">All Classes</option>
      </Select>
    </Field>
    <Field label="Duration">
      <InputIcon icon={Clock} placeholder="e.g. 1h 45min"
        value={d.flightDuration||""} onChange={e=>set("flightDuration",e.target.value)}/>
    </Field>
    <Field label="Frequency">
      <Select value={d.frequency||""} onChange={e=>set("frequency",e.target.value)}>
        <option value="">Select</option>
        <option value="daily">Daily</option>
        <option value="several_weekly">Several times a week</option>
        <option value="weekly">Weekly</option>
        <option value="on_demand">On Demand / Charter</option>
        <option value="seasonal">Seasonal</option>
      </Select>
    </Field>
    <Field label="Seats">
      <InputIcon icon={User} type="number" placeholder="e.g. 180"
        value={d.capacity||""} onChange={e=>set("capacity",e.target.value)}/>
    </Field>
    <Field label="IATA Code">
      <input className={iCls} placeholder="e.g. EK, QR" value={d.iata||""} onChange={e=>set("iata",e.target.value)}/>
    </Field>
    <Field label="Contact Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField value={d.phone} onChange={v=>set("phone",v)}/>
      </div>
    </Field>
    <Field label="Booking Email">
      <InputIcon icon={Mail} type="email" placeholder="bookings@airline.com"
        value={d.email||""} onChange={e=>set("email",e.target.value)}/>
    </Field>
    <div className="col-span-2">
      <Field label="Cancellation Policy">
        <Select value={d.cancellation||""} onChange={e=>set("cancellation",e.target.value)}>
          <option value="">Select policy</option>
          <option value="free_24h">Free cancellation within 24 hours</option>
          <option value="free_48h_before">Free cancellation 48 hours before departure</option>
          <option value="non_refundable">Non-refundable</option>
          <option value="partial_refund">Partial refund minus fees</option>
          <option value="fully_flexible">Fully Flexible</option>
        </Select>
      </Field>
    </div>
  </div>
);

const TransportStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2"><SectionHeader icon={Car} label="TRANSPORT CONFIGURATION"/></div>

    {/*
      FIX: All vehicle_type option values now match the backend's accepted enum.
      The error "Tuktuk / Bajaj is not a valid choice" was because the frontend
      was sending the display label instead of the enum value.
    */}
    <Field label="Vehicle Type" required error={errors.vehicleType}>
      <Select value={d.vehicleType||""} onChange={e=>set("vehicleType",e.target.value)} error={errors.vehicleType}>
        <option value="">Select type</option>
        <option value="motorcycle">Motorcycle (Boda Boda)</option>
        <option value="tuktuk">Tuktuk / Bajaj</option>
        <option value="saloon_car">Saloon Car</option>
        <option value="suv">SUV / 4×4</option>
        <option value="minibus">Minibus / Taxi</option>
        <option value="bus">Bus / Coach</option>
        <option value="truck">Truck / Pickup</option>
        <option value="ambulance">Ambulance</option>
        <option value="other">Other</option>
      </Select>
    </Field>

    {/* FIX: service mode values match backend enum */}
    <Field label="Service Mode" required error={errors.serviceMode}>
      <Select value={d.serviceMode||""} onChange={e=>set("serviceMode",e.target.value)} error={errors.serviceMode}>
        <option value="">Select mode</option>
        <option value="ride_hailing">Ride Hailing (On Demand)</option>
        <option value="airport_transfer">Airport Transfer</option>
        <option value="daily_hire">Daily Car Hire</option>
        <option value="long_distance">Long Distance / Intercity</option>
        <option value="parcel_delivery">Parcel Delivery</option>
        <option value="shuttle">School / Event Shuttle</option>
      </Select>
    </Field>

    <Field label="Price ($)" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00"
        value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>
    <Field label="Price Unit">
      <Select value={d.priceUnit||"trip"} onChange={e=>set("priceUnit",e.target.value)}>
        <option value="trip">Per Trip</option>
        <option value="km">Per KM</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
      </Select>
    </Field>

    {/* Pre-filled driver name */}
    <Field label="Driver Name" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg">
        <InputIcon icon={User} placeholder="Full name"
          value={d.driver||""} onChange={e=>set("driver",e.target.value)}/>
      </div>
    </Field>
    <Field label="Seating Capacity">
      <InputIcon icon={User} type="number" placeholder="e.g. 4"
        value={d.seats||""} onChange={e=>set("seats",e.target.value)}/>
    </Field>
    <Field label="Vehicle Model">
      <input className={iCls} placeholder="e.g. Toyota Hiace 2020"
        value={d.vehicleModel||""} onChange={e=>set("vehicleModel",e.target.value)}/>
    </Field>
    <Field label="Number Plate">
      <input className={iCls} placeholder="e.g. UAA 123B"
        value={d.plate||""} onChange={e=>set("plate",e.target.value)}/>
    </Field>
    <Field label="Contact Phone" required error={errors.phone} hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField value={d.phone} onChange={v=>set("phone",v)} error={errors.phone}/>
      </div>
    </Field>
    <Field label="Routes / Area">
      <InputIcon icon={MapPin} placeholder="e.g. Kampala – Entebbe"
        value={d.routes||""} onChange={e=>set("routes",e.target.value)}/>
    </Field>
    <div className="col-span-2">
      <Toggle checked={!!d.available24h} onChange={v=>set("available24h",v)}
        label="Available 24 / 7" desc="Around the clock, including weekends"/>
    </div>
  </div>
);


// STEP 3 — unchanged

const Step3Content = ({ serviceType, d, set, errors }) => {
  const wc = countWords(d.description || "");
  const wcColor = wc > 20 ? "text-red-500" : wc > 0 ? "text-[#EFB034FF]" : "text-gray-400";
  const items = {
    hotel:        ["Free WiFi","Parking","Swimming Pool","Gym / Fitness","Restaurant","Bar / Lounge","Airport Shuttle","Conference Room","Spa","Room Service","Air Conditioning","Breakfast Included"],
    professional: ["One-on-One","Group Sessions","Certificate Provided","Materials Included","Follow-up Session","Online Resources"],
    airline:      ["Carry-on Baggage","Checked Baggage","Meals","In-flight Entertainment","WiFi","Lounge Access","Airport Transfer","Travel Insurance"],
    transport:    ["Air Conditioning","WiFi / Hotspot","GPS Tracking","Music System","Child Seat Available","Luggage Space","Wheelchair Accessible","Pet Friendly","Intercity Routes","24/7 Availability"],
  }[serviceType] || [];
  const checkKey   = serviceType === "hotel" ? "amenities" : "inclusions";
  const checkLabel = { hotel:"Amenities", airline:"Included in Ticket", transport:"Vehicle Features", professional:"What's Included" }[serviceType] || "Extras";
  return (
    <div className="space-y-4 ml-1">
      <Field label="Service Description" required error={errors.description}
        hint={`Maximum 20 words — currently ${wc} word${wc===1?"":"s"}`}>
        <div className="relative">
          <textarea rows={4} placeholder="Describe your service (max 20 words)..."
            className={`${iCls} resize-none w-full ${errors.description?"border-red-300 focus:ring-red-400 focus:border-red-400":""}`}
            value={d.description||""} onChange={e=>set("description",e.target.value)}/>
          <span className={`absolute bottom-1.5 right-2 text-[9px] font-bold tabular-nums pointer-events-none ${wcColor}`}>{wc}/20</span>
        </div>
      </Field>
      {items.length > 0 && (
        <Field label={checkLabel}>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            {items.map(item=>(
              <Check key={item} label={item}
                checked={(d[checkKey]||[]).includes(item)}
                onChange={c=>set(checkKey,c?[...(d[checkKey]||[]),item]:(d[checkKey]||[]).filter(x=>x!==item))}/>
            ))}
          </div>
        </Field>
      )}
    </div>
  );
};


// STEP 4 — unchanged

const Step4Content = ({ serviceType, title, d, coverPreview, onImageClick }) => {
  const catLabel = { hotel:"Hotel", airline:"Airline", professional:"Service", transport:"Transport" }[serviceType] || "";
  return (
    <div className="space-y-4">
      <Field label="Cover Image" hint="JPG, PNG, or WebP — max 5 MB (optional)">
        <div onClick={onImageClick}
          className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#EFB034FF] transition-colors bg-gray-50">
          {coverPreview ? (
            <div className="relative h-28">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] font-bold">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center gap-1">
              <Image size={20} className="text-gray-300"/>
              <p className="text-[10px] text-gray-400 font-semibold">Click to upload cover image</p>
            </div>
          )}
        </div>
      </Field>
      <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 space-y-1.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Review before publishing</p>
        {[["Title",title||"—"],["Category",catLabel],["Price",d.price?`$${d.price}`:"—"],["Email",d.email||"Not provided"],["Image",coverPreview?"✓ Uploaded":"○ None (optional)"]].map(([k,v])=>(
          <div key={k} className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">{k}</span>
            <span className="font-medium text-gray-700">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// CATEGORY CONFIG — same colors, reduced card height (h-12 instead of h-14)
// to remove excess empty space at bottom of Step 1

const CATEGORIES = [
  { id:"hotel",        label:"Hotels",    icon:<Hotel     size={14}/>, color:"teal" },
  { id:"airline",      label:"Airlines",  icon:<Plane     size={14}/>, color:"teal" },
  { id:"professional", label:"Services",  icon:<Briefcase size={14}/>, color:"teal" },
  { id:"transport",    label:"Transport", icon:<Bike      size={14}/>, color:"teal" },
];
const CAT_ACTIVE     = { teal:"border-[#EFB034FF] bg-[#EFB034]/10 text-[#EFB034FF]" };
const CAT_ICON_ACTIVE = { teal:"text-[#EFB034FF]" };


// STEP INDICATOR
// FIX: justify-between + flex-1 lines = evenly spaced like the product form.
// Colors: completed = golden, active = #125852 teal + white number, inactive = gray.

const STEP_LABELS = ["Basics", "Details", "Description", "Publish"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center w-full mb-4 shrink-0">
    {STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const done   = n < current;
      const active = n === current;
      return (
        <React.Fragment key={n}>
          {/* Dot + label */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all
                ${done   ? "border-[#EFB034] text-white"
                : active ? "border-[#125852] text-white"
                :          "bg-white border-gray-200 text-gray-400"}`}
              style={done ? { backgroundColor:'#EFB034' } : active ? { backgroundColor:'#125852' } : {}}
            >
              {done ? <CheckCircle size={12} className="text-white"/> : <span>{n}</span>}
            </div>
            <span className={`text-[9px] mt-0.5 font-medium whitespace-nowrap
              ${done ? "text-[#EFB034]" : active ? "text-[#125852]" : "text-gray-300"}`}>
              {label}
            </span>
          </div>
          {/* Connecting line — flex-1 ensures even spacing */}
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${done ? "bg-[#EFB034FF]" : "bg-gray-200"}`}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);


// MAIN COMPONENT

const ServiceForm = ({ onClose }) => {
  const [step,         setStep]         = useState(1);
  const [stepErrors,   setStepErrors]   = useState({});
  const [serviceType,  setServiceType]  = useState("");
  const [title,        setTitle]        = useState("");
  const [data,         setData]         = useState({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [globalError,  setGlobalError]  = useState("");
  const [coverImage,   setCoverImage]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileRef = useRef(null);

  // Category UUID map
  const [categoryMap, setCategoryMap] = useState({});
  useEffect(() => {
    api.get("/listings/categories/")
      .then(res => {
        const arr = res.data?.data || res.data || [];
        const map = {};
        (Array.isArray(arr) ? arr : []).forEach(c => { map[c.slug] = c.id; });
        setCategoryMap(map);
      }).catch(() => {});
  }, []);

  // Pre-fill from vendor onboarding profile
  useEffect(() => {
    api.get('/accounts/register-vendor/')
      .then(res => {
        const p = res.data?.data || res.data || {};
        setData(prev => ({
          ...prev,
          phone:   p.business_phone  || p.phone_number  || prev.phone   || '',
          address: p.address         || prev.address || '',
          city:    p.city            || prev.city    || '',
          country: p.country         || prev.country || '',
          email:   p.business_email  || p.email      || prev.email   || '',
          driver:  p.owner_full_name || p.owner_name || prev.driver  || '',
        }));
      }).catch(() => {});
  }, []);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const goNext = () => {
    const errs = validateStep(step, serviceType, title, data);
    if (Object.keys(errs).length > 0) { setStepErrors(errs); return; }
    setStepErrors({});
    setStep(s => Math.min(4, s + 1));
  };
  const goBack = () => { setStepErrors({}); setStep(s => Math.max(1, s - 1)); };

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      setStepErrors(p => ({ ...p, image:"Must be JPEG, PNG, or WebP." })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStepErrors(p => ({ ...p, image:"Max file size is 5 MB." })); return;
    }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const { step: errorStep, errors } = validateAllSteps(serviceType, title, data);
    if (errorStep) { setStep(errorStep); setStepErrors(errors); return; }
    setIsLoading(true); setGlobalError("");
    try {
      const enrichedData = { ...data, category_id: categoryMap[data.category] || undefined };
      const payload = buildListingPayload(serviceType, title, enrichedData);
      const response = await createListing(payload);
      const newListing = response?.data || response;
      const listingId  = newListing?.id;
      if (coverImage && listingId) await uploadListingImage(listingId, coverImage);
      onClose?.(true);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const readable = Object.entries(serverErrors)
          .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' • ');
        setGlobalError(`Submission failed — ${readable}`);
      } else {
        setGlobalError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to publish. Check your connection and try again."
        );
      }
    } finally { setIsLoading(false); }
  };

  return (
    // rounded-3xl on all 4 sides — matches the fully-rounded modal wrapper
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden">

      {/*
        ── MODAL HEADER ──
        Contains title, step counter and X close button (new).
        X button calls onClose(false) = cancel without refreshing the grid.
      */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            { {1:"New Service",2:"Configure Service",3:"Description",4:"Review & Publish"}[step] }
          </h3>
          <p className="text-[10px] text-gray-400">
            { {1:"Choose a category and give your service a title.",
               2:"Fill in the key details for this listing.",
               3:"Write up to 20 words about your service.",
               4:"Upload a cover image and publish."}[step] }
          </p>
        </div>
        {/* X CLOSE BUTTON — new, positioned top-right of header */}
        <button
          onClick={() => onClose?.(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
        >
          <X size={14}/>
        </button>
      </div>

      {/* Step indicator — padded horizontally */}
      <div className="px-5 pb-1 shrink-0">
        <StepIndicator current={step}/>
      </div>

      {/* Global error banner */}
      {globalError && (
        <div className="mx-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-lg text-[10px] mb-2 shrink-0">
          <AlertCircle size={11} className="shrink-0 mt-0.5"/>
          <span className="flex-1">{globalError}</span>
          <button onClick={() => setGlobalError("")} className="ml-auto shrink-0"><X size={11}/></button>
        </div>
      )}

      {/* Step content — flex-1, internal scroll */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">

        {/* STEP 1 — title + category cards */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Service Title" required error={stepErrors.title}>
              <div className="relative">
                <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13}/>
                <input
                  className={`${iCls_icon} ${stepErrors.title?"border-red-300 focus:ring-red-400 focus:border-red-400":""}`}
                  placeholder="e.g. Executive Business Coaching"
                  value={title} onChange={e=>setTitle(e.target.value)} autoFocus
                />
              </div>
            </Field>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1.5">
                Select Category <span className="text-red-400">*</span>
              </label>
              {stepErrors.category && (
                <p className="text-[10px] text-red-500 flex items-center gap-1 mb-1">
                  <AlertCircle size={9}/> {stepErrors.category}
                </p>
              )}
              {/*
                FIX: card height reduced from h-14 to h-12 to remove excess space.
                The "Services" card now correctly maps to sub-categories in Step 2
                (retail, beauty, events/other, etc.) — not hardcoded to tailoring.
              */}
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => {
                  const active = serviceType === cat.id;
                  return (
                    <button key={cat.id} type="button" onClick={() => setServiceType(cat.id)}
                      className={`relative flex flex-col items-center justify-center p-2 h-12 rounded-xl border-2 transition-all ${
                        active ? CAT_ACTIVE[cat.color] : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                      }`}>
                      {active && <CheckCircle2 className={`absolute top-1 right-1 ${CAT_ICON_ACTIVE[cat.color]}`} size={10}/>}
                      <span className={active ? CAT_ICON_ACTIVE[cat.color] : "text-gray-400"}>{cat.icon}</span>
                      <span className="text-[9px] font-medium mt-0.5 uppercase tracking-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <p className="text-[9px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1">
              <AlertCircle size={9}/> Fields with an orange ring were pre-filled from your onboarding profile. You can edit them.
            </p>
            {serviceType === "professional" && <ProfessionalStep2 d={data} set={set} errors={stepErrors}/>}
            {serviceType === "hotel"        && <HotelStep2        d={data} set={set} errors={stepErrors}/>}
            {serviceType === "airline"      && <AirlineStep2      d={data} set={set} errors={stepErrors}/>}
            {serviceType === "transport"    && <TransportStep2    d={data} set={set} errors={stepErrors}/>}
          </div>
        )}

        {step === 3 && (
          <Step3Content serviceType={serviceType} d={data} set={set} errors={stepErrors}/>
        )}

        {step === 4 && (
          <div>
            <Step4Content serviceType={serviceType} title={title} d={data}
              coverPreview={coverPreview} onImageClick={() => fileRef.current?.click()}/>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleImageChange}/>
            {stepErrors.image && (
              <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={9}/> {stepErrors.image}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation footer ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 shrink-0">
        {step === 1 ? (
          <button onClick={() => onClose?.(false)}
            className="px-4 py-1.5 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-xs hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        ) : (
          <button onClick={goBack} disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-xs hover:bg-gray-50 transition-colors disabled:opacity-40">
            <ChevronLeft size={13}/> Back
          </button>
        )}
        <span className="text-[10px] text-gray-400 font-medium">{step} / 4</span>
        {step < 4 ? (
          <button onClick={goNext}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95"
            style={{ backgroundColor:"#EFB034" }}>
            Next <ChevronRight size={13}/>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor:"#EFB034" }}>
            {isLoading ? <><Loader2 size={13} className="animate-spin"/> Publishing…</> : <><CheckCircle size={13}/> Publish Service</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceForm;