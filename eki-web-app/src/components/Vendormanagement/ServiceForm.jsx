import React, { useState, useEffect, useRef } from "react";
import {
  Hotel, Plane, Briefcase, Bike, Globe, MapPin, DollarSign, FileText, Clock,
  ToggleLeft, ToggleRight, CheckCircle2, ChevronDown, Phone, Mail, Link,
  Car, User, Tag, X, ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle, Loader2, Scissors, Plus, Archive, Send, BookOpen,
} from "lucide-react";
import { uploadListingImage } from "../../services/api";
import api from "../../services/api";
import { buildListingPayload } from "../../utils/buildListingPayload";
import { countWords, validateStep, validateAllSteps } from "../../utils/ServiceFormValidation";

// PHONE INPUT (optional dependency)
let PhoneInput = null;
try { PhoneInput = require('react-phone-input-2').default; } catch (_) {}

// SHARED UI ATOMS
const Field = ({ label, required, hint, error, children }) => (
  <div className="space-y-0.5">
    <label className="block text-[10px] font-medium text-gray-700">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[9px] text-red-500 flex items-center gap-1"><AlertCircle size={8}/> {error}</p>}
    {hint && !error && <p className="text-[8px] text-gray-400">{hint}</p>}
  </div>
);

const iCls      = "w-full px-2 py-1 border border-gray-200 rounded-lg text-[11px] bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034] focus:border-[#EFB034] transition-all placeholder:text-gray-400";
const iCls_icon = "w-full pl-7 pr-2 py-1 border border-gray-200 rounded-lg text-[11px] bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034] focus:border-[#EFB034] transition-all placeholder:text-gray-400";

const InputIcon = ({ icon: Icon, error, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11}/>
    <input className={`${iCls_icon} ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`} {...props}/>
  </div>
);

const Sel = ({ error, children, ...props }) => (
  <div className="relative">
    <select className={`${iCls} appearance-none pr-6 cursor-pointer ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`} {...props}>
      {children}
    </select>
    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg border border-gray-100">
    <div>
      <p className="text-[10px] font-medium text-gray-800">{label}</p>
      {desc && <p className="text-[8px] text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)} className="shrink-0 ml-2">
      {checked ? <ToggleRight size={20} className="text-[#EFB034]"/> : <ToggleLeft size={20} className="text-gray-300"/>}
    </button>
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1 text-[9px] text-gray-600 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-2.5 h-2.5 accent-[#EFB034] rounded"/>
    {label}
  </label>
);

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium mb-1.5 bg-[#EFB034]/10 border-[#EFB034]/20 text-[#C8900A]">
    <Icon size={11}/> {label}
  </div>
);

const PhoneField = ({ value, onChange, error }) => {
  if (PhoneInput) {
    return (
      <PhoneInput country="ug" value={(value||'').replace(/^\+/,'')}
        onChange={p => onChange('+'+p)}
        inputClass={`!w-full !text-[11px] !border-gray-200 !rounded-lg !h-6 !pl-10 ${error?'!border-red-300':''}`}
        buttonClass="!border-gray-200 !rounded-l-lg !bg-gray-50"
        containerClass="!w-full" specialLabel="" placeholder="+256 700 000 000"/>
    );
  }
  return <InputIcon icon={Phone} type="tel" placeholder="+256 700 000 000" value={value||''} onChange={e=>onChange(e.target.value)} error={error}/>;
};

// IMAGE UPLOAD SLOT
const ImageSlot = ({ preview, label, onClick }) => (
  <div onClick={onClick}
    className="flex-1 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#EFB034] transition-colors bg-gray-50 min-h-[70px]">
    {preview ? (
      <div className="relative h-[70px]">
        <img src={preview} alt={label} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-[9px] font-bold">Click to change</p>
        </div>
      </div>
    ) : (
      <div className="h-[70px] flex flex-col items-center justify-center gap-0.5">
        <Plus size={14} className="text-gray-300"/>
        <p className="text-[9px] text-gray-400 font-semibold text-center px-2">{label}</p>
      </div>
    )}
  </div>
);

// STEP 2 FORMS

const ProfessionalStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2"><SectionHeader icon={Briefcase} label="SERVICE CONFIGURATION"/></div>
    <Field label="Sub-Category" required error={errors.category}>
      <Sel value={d.category||""} onChange={e=>set("category",e.target.value)} error={errors.category}>
        <option value="">Select sub-category</option>
        <option value="tailoring">Tailoring</option>
        <option value="beauty">Beauty & Health</option>
        <option value="food">Food & Beverages</option>
        <option value="other">Events & Decoration</option>
        <option value="other">Education & Tutoring</option>
        <option value="professional">Consulting & Coaching</option>
        <option value="other">IT & Technology</option>
        <option value="other">Cleaning & Maintenance</option>
        <option value="other">Other / General Services</option>
      </Sel>
    </Field>
    <Field label="Base Price" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>
    <Field label="Price Unit">
      <Sel value={d.priceUnit||"session"} onChange={e=>set("priceUnit",e.target.value)}>
        <option value="session">Per Session</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
        <option value="project">Per Project</option>
        <option value="month">Per Month</option>
      </Sel>
    </Field>
    <Field label="Duration"><InputIcon icon={Clock} placeholder="e.g. 60 min" value={d.duration||""} onChange={e=>set("duration",e.target.value)}/></Field>
    <Field label="Availability">
      <Sel value={d.availability||"available"} onChange={e=>set("availability",e.target.value)}>
        <option value="available">Available Now</option>
        <option value="limited">Limited Slots</option>
        <option value="booked">Fully Booked</option>
        <option value="by_request">By Request Only</option>
      </Sel>
    </Field>
    <Field label="Languages"><InputIcon icon={Globe} placeholder="English, French…" value={d.languages||""} onChange={e=>set("languages",e.target.value)}/></Field>
    {d.category === "tailoring" && (
      <Field label="Fabric Material" required error={errors.fabricMaterial} hint="Required for tailoring">
        <InputIcon icon={Scissors} placeholder="e.g. Wool blend, Cotton" value={d.fabricMaterial||""} onChange={e=>set("fabricMaterial",e.target.value)} error={errors.fabricMaterial}/>
      </Field>
    )}
    <Field label="Contact Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg"><PhoneField value={d.phone} onChange={v=>set("phone",v)} error={errors.phone}/></div>
    </Field>
    <Field label="Contact Email" hint="Pre-filled from your profile">
      <InputIcon icon={Mail} type="email" placeholder="your@email.com" value={d.email||""} onChange={e=>set("email",e.target.value)}/>
    </Field>
    <div className="col-span-2"><Toggle checked={!!d.remote} onChange={v=>set("remote",v)} label="Remote / Online offering" desc="Can be delivered via video call"/></div>
    {d.remote && (
      <div className="col-span-2">
        <Field label="Platform link" hint="Zoom, Calendly, etc.">
          <InputIcon icon={Link} placeholder="https://calendly.com/yourname" value={d.platform||""} onChange={e=>set("platform",e.target.value)}/>
        </Field>
      </div>
    )}
  </div>
);

const HotelStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2"><SectionHeader icon={Hotel} label="HOTEL CONFIGURATION"/></div>
    <Field label="Property Type" required error={errors.propertyType}>
      <Sel value={d.propertyType||""} onChange={e=>set("propertyType",e.target.value)} error={errors.propertyType}>
        <option value="">Select type</option>
        <option value="hotel">Hotel</option><option value="lodge">Lodge</option>
        <option value="guesthouse">Guesthouse</option><option value="airbnb">Airbnb / Short-Stay</option>
        <option value="resort">Resort</option><option value="hostel">Hostel</option>
        <option value="serviced_apartment">Serviced Apartment</option><option value="villa">Villa</option>
      </Sel>
    </Field>
    <Field label="Star Rating">
      <Sel value={d.stars||""} onChange={e=>set("stars",e.target.value)}>
        <option value="">Select</option>
        {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
        <option value="unrated">Unrated</option>
      </Sel>
    </Field>
    <Field label="Price / Night" required error={errors.price}>
      <InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/>
    </Field>
    <Field label="Room Category" required error={errors.roomCategory}>
      <Sel value={d.roomCategory||""} onChange={e=>set("roomCategory",e.target.value)} error={errors.roomCategory}>
        <option value="">Select room</option>
        {["Standard Room","Deluxe Room","Suite","Executive Room","Family Room","Penthouse","Entire Unit"].map(v=><option key={v}>{v}</option>)}
      </Sel>
    </Field>
    <Field label="Max Guests"><InputIcon icon={User} type="number" placeholder="2" value={d.maxGuests||""} onChange={e=>set("maxGuests",e.target.value)}/></Field>
    <Field label="Total Rooms"><InputIcon icon={Tag} type="number" placeholder="24" value={d.totalRooms||""} onChange={e=>set("totalRooms",e.target.value)}/></Field>
    <Field label="Check-In"><input type="time" className={iCls} value={d.checkIn||""} onChange={e=>set("checkIn",e.target.value)}/></Field>
    <Field label="Check-Out"><input type="time" className={iCls} value={d.checkOut||""} onChange={e=>set("checkOut",e.target.value)}/></Field>
    <div className="col-span-2">
      <Field label="Address" required error={errors.address} hint="Pre-filled from your profile">
        <div className="ring-1 ring-amber-300 rounded-lg">
          <InputIcon icon={MapPin} placeholder="Street, City, Country" value={d.address||""} onChange={e=>set("address",e.target.value)} error={errors.address}/>
        </div>
      </Field>
    </div>
    <Field label="Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg"><PhoneField value={d.phone} onChange={v=>set("phone",v)}/></div>
    </Field>
    <Field label="Booking Email"><InputIcon icon={Mail} type="email" placeholder="reservations@hotel.com" value={d.email||""} onChange={e=>set("email",e.target.value)}/></Field>
    <div className="col-span-2"><Field label="Website"><InputIcon icon={Globe} type="url" placeholder="https://www.yourhotel.com" value={d.website||""} onChange={e=>set("website",e.target.value)}/></Field></div>
    <div className="col-span-2">
      <Field label="Cancellation Policy">
        <Sel value={d.cancellation||""} onChange={e=>set("cancellation",e.target.value)}>
          <option value="">Select policy</option>
          <option value="free_24h">Free cancellation up to 24 hours</option>
          <option value="free_48h">Free cancellation up to 48 hours</option>
          <option value="free_7d">Free cancellation up to 7 days</option>
          <option value="non_refundable">Non-refundable</option>
          <option value="partial_50">Partial refund (50%)</option>
        </Sel>
      </Field>
    </div>
  </div>
);

const AirlineStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2"><SectionHeader icon={Plane} label="FLIGHT SPECIFICATIONS"/></div>
    <Field label="Service Type" required error={errors.serviceType}>
      <Sel value={d.serviceType||""} onChange={e=>set("serviceType",e.target.value)} error={errors.serviceType}>
        <option value="">Select type</option>
        <option value="scheduled">Scheduled Flight</option><option value="charter">Charter Flight</option>
        <option value="cargo">Cargo Service</option><option value="helicopter">Helicopter Transfer</option>
        <option value="private_jet">Private Jet</option><option value="ticketing">Travel Agency / Ticketing</option>
      </Sel>
    </Field>
    <Field label="Flight Code"><input className={iCls} placeholder="e.g. UG-202" value={d.flightCode||""} onChange={e=>set("flightCode",e.target.value)}/></Field>
    <Field label="Origin" required error={errors.origin}><InputIcon icon={MapPin} placeholder="e.g. Entebbe (EBB)" value={d.origin||""} onChange={e=>set("origin",e.target.value)} error={errors.origin}/></Field>
    <Field label="Destination(s)" required error={errors.destinations}><InputIcon icon={MapPin} placeholder="e.g. Nairobi, Dubai" value={d.destinations||""} onChange={e=>set("destinations",e.target.value)} error={errors.destinations}/></Field>
    <Field label="Price / Seat" required error={errors.price}><InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/></Field>
    <Field label="Cabin Class">
      <Sel value={d.cabinClass||""} onChange={e=>set("cabinClass",e.target.value)}>
        <option value="">Select</option>
        <option value="economy">Economy</option><option value="premium_economy">Premium Economy</option>
        <option value="business">Business Class</option><option value="first">First Class</option><option value="all">All Classes</option>
      </Sel>
    </Field>
    <Field label="Duration"><InputIcon icon={Clock} placeholder="e.g. 1h 45min" value={d.flightDuration||""} onChange={e=>set("flightDuration",e.target.value)}/></Field>
    <Field label="Frequency">
      <Sel value={d.frequency||""} onChange={e=>set("frequency",e.target.value)}>
        <option value="">Select</option>
        <option value="daily">Daily</option><option value="several_weekly">Several times a week</option>
        <option value="weekly">Weekly</option><option value="on_demand">On Demand / Charter</option><option value="seasonal">Seasonal</option>
      </Sel>
    </Field>
    <Field label="Seats"><InputIcon icon={User} type="number" placeholder="180" value={d.capacity||""} onChange={e=>set("capacity",e.target.value)}/></Field>
    <Field label="IATA Code"><input className={iCls} placeholder="e.g. EK, QR" value={d.iata||""} onChange={e=>set("iata",e.target.value)}/></Field>
    <Field label="Contact Phone" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg"><PhoneField value={d.phone} onChange={v=>set("phone",v)}/></div>
    </Field>
    <Field label="Booking Email"><InputIcon icon={Mail} type="email" placeholder="bookings@airline.com" value={d.email||""} onChange={e=>set("email",e.target.value)}/></Field>
  </div>
);

const TransportStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2"><SectionHeader icon={Car} label="TRANSPORT CONFIGURATION"/></div>
    <Field label="Vehicle Type" required error={errors.vehicleType}>
      <Sel value={d.vehicleType||""} onChange={e=>set("vehicleType",e.target.value)} error={errors.vehicleType}>
        <option value="">Select type</option>
        <option value="motorcycle">Motorcycle (Boda Boda)</option><option value="tuktuk">Tuktuk / Bajaj</option>
        <option value="saloon_car">Saloon Car</option><option value="suv">SUV / 4×4</option>
        <option value="minibus">Minibus / Taxi</option><option value="bus">Bus / Coach</option>
        <option value="truck">Truck / Pickup</option><option value="ambulance">Ambulance</option><option value="other">Other</option>
      </Sel>
    </Field>
    <Field label="Service Mode" required error={errors.serviceMode}>
      <Sel value={d.serviceMode||""} onChange={e=>set("serviceMode",e.target.value)} error={errors.serviceMode}>
        <option value="">Select mode</option>
        <option value="ride_hailing">Ride Hailing (On Demand)</option><option value="airport_transfer">Airport Transfer</option>
        <option value="daily_hire">Daily Car Hire</option><option value="long_distance">Long Distance / Intercity</option>
        <option value="parcel_delivery">Parcel Delivery</option><option value="shuttle">School / Event Shuttle</option>
      </Sel>
    </Field>
    <Field label="Price" required error={errors.price}><InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)} error={errors.price}/></Field>
    <Field label="Price Unit">
      <Sel value={d.priceUnit||"trip"} onChange={e=>set("priceUnit",e.target.value)}>
        <option value="trip">Per Trip</option><option value="km">Per KM</option>
        <option value="hour">Per Hour</option><option value="day">Per Day</option>
      </Sel>
    </Field>
    <Field label="Driver Name" hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg"><InputIcon icon={User} placeholder="Full name" value={d.driver||""} onChange={e=>set("driver",e.target.value)}/></div>
    </Field>
    <Field label="Seating Capacity"><InputIcon icon={User} type="number" placeholder="4" value={d.seats||""} onChange={e=>set("seats",e.target.value)}/></Field>
    <Field label="Vehicle Model"><input className={iCls} placeholder="e.g. Toyota Hiace 2020" value={d.vehicleModel||""} onChange={e=>set("vehicleModel",e.target.value)}/></Field>
    <Field label="Number Plate"><input className={iCls} placeholder="e.g. UAA 123B" value={d.plate||""} onChange={e=>set("plate",e.target.value)}/></Field>
    <Field label="Contact Phone" required error={errors.phone} hint="Pre-filled from your profile">
      <div className="ring-1 ring-amber-300 rounded-lg"><PhoneField value={d.phone} onChange={v=>set("phone",v)} error={errors.phone}/></div>
    </Field>
    <Field label="Routes / Area"><InputIcon icon={MapPin} placeholder="e.g. Kampala – Entebbe" value={d.routes||""} onChange={e=>set("routes",e.target.value)}/></Field>
    <div className="col-span-2"><Toggle checked={!!d.available24h} onChange={v=>set("available24h",v)} label="Available 24/7" desc="Around the clock, including weekends"/></div>
  </div>
);

// STEP 3 — Description + amenities/inclusions
const Step3Content = ({ serviceType, d, set, errors }) => {
  const wc = countWords(d.description || "");
  const wcColor = wc > 20 ? "text-red-500" : wc > 0 ? "text-[#C8900A]" : "text-gray-400";
  const items = {
    hotel:["Free WiFi","Parking","Swimming Pool","Gym / Fitness","Restaurant","Bar / Lounge","Airport Shuttle","Conference Room","Spa","Room Service","Air Conditioning","Breakfast Included"],
    professional:["One-on-One","Group Sessions","Certificate Provided","Materials Included","Follow-up Session","Online Resources"],
    airline:["Carry-on Baggage","Checked Baggage","Meals","In-flight Entertainment","WiFi","Lounge Access","Airport Transfer","Travel Insurance"],
    transport:["Air Conditioning","WiFi / Hotspot","GPS Tracking","Music System","Child Seat Available","Luggage Space","Wheelchair Accessible","Pet Friendly","Intercity Routes","24/7 Availability"],
  }[serviceType] || [];
  const checkKey   = serviceType === "hotel" ? "amenities" : "inclusions";
  const checkLabel = { hotel:"Amenities", airline:"Included in Ticket", transport:"Vehicle Features", professional:"What's Included" }[serviceType] || "Extras";

  return (
    <div className="space-y-3 ml-0.5">
      <Field label="Service Description" required error={errors.description} hint={`Maximum 20 words — currently ${wc} word${wc===1?"":"s"}`}>
        <div className="relative">
          <textarea rows={3} placeholder="Describe your service (max 20 words)..."
            className={`${iCls} resize-none w-full ${errors.description?"border-red-300 focus:ring-red-400 focus:border-red-400":""}`}
            value={d.description||""} onChange={e=>set("description",e.target.value)}/>
          <span className={`absolute bottom-1 right-2 text-[8px] font-bold tabular-nums pointer-events-none ${wcColor}`}>{wc}/20</span>
        </div>
      </Field>
      {items.length > 0 && (
        <Field label={checkLabel}>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
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

// STEP 4 — Images + Status selector + Review
const Step4Content = ({
  serviceType, title, d, set,
  coverPreview1, coverPreview2,
  onImage1Click, onImage2Click,
  selectedStatus, onStatusChange,
}) => {
  const catLabel = { hotel:"Hotel", airline:"Airline", professional:"Service", transport:"Transport" }[serviceType] || "";

  return (
    <div className="space-y-3">
      {/* Cover images */}
      <Field label="Cover Images" hint="Upload up to 2 images — JPG, PNG, or WebP, max 5 MB each (optional)">
        <div className="flex gap-2">
          <ImageSlot preview={coverPreview1} label="Primary Image" onClick={onImage1Click}/>
          <ImageSlot preview={coverPreview2} label="Second Image (optional)" onClick={onImage2Click}/>
        </div>
      </Field>

      {/*STATUS SELECTOR
          published → service goes live immediately, visible to all buyers
          draft     → saved privately, only the vendor can see it
          archived  → hidden from buyers, kept for records (useful for seasonal services)
      */}
      <div>
        <p className="text-[10px] font-medium text-gray-700 mb-1.5">Listing Status</p>
        <div className="grid grid-cols-3 gap-1.5">

          {/* PUBLISH option */}
          <button type="button"
            onClick={() => onStatusChange('published')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all text-center
              ${selectedStatus === 'published'
                ? 'border-[#EFB034] bg-[#1D4D4C]/10 text-[#EFB034]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-[#EFB034] hover:bg-[#EFB034]/5'}`}
          >
            <Send size={12} className={selectedStatus === 'published' ? 'text-[#EFB034]' : 'text-gray-400'}/>
            <span className="text-[9px] font-bold uppercase tracking-tight">Publish</span>
            <span className="text-[7px] leading-tight opacity-70">Live & visible</span>
          </button>

          {/* DRAFT option */}
          <button type="button"
            onClick={() => onStatusChange('draft')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all text-center
              ${selectedStatus === 'draft'
                ? 'border-[#1D4D4C] bg-[#1D4D4C]/10 text-[#1D4D4C]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-[#1D4D4C] hover:bg-[#1D4D4C]/5'}`}
          >
            <BookOpen size={12} className={selectedStatus === 'draft' ? 'text-[#1D4D4C]' : 'text-gray-400'}/>
            <span className="text-[9px] font-bold uppercase tracking-tight">Draft</span>
            <span className="text-[7px] leading-tight opacity-70">Save privately</span>
          </button>

          {/* ARCHIVE option */}
          <button type="button"
            onClick={() => onStatusChange('archived')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all text-center
              ${selectedStatus === 'archived'
                ? 'border-gray-500 bg-gray-100 text-gray-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50'}`}
          >
            <Archive size={12} className={selectedStatus === 'archived' ? 'text-gray-600' : 'text-gray-400'}/>
            <span className="text-[9px] font-bold uppercase tracking-tight">Archive</span>
            <span className="text-[7px] leading-tight opacity-70">Hide & keep</span>
          </button>
        </div>
        {/* Status explanation */}
        <p className="text-[8px] text-gray-400 mt-1">
          {selectedStatus === 'published' && '✓ Service will be visible to all buyers on the marketplace.'}
          {selectedStatus === 'draft' && '✓ Service will be saved but only visible to you. You can publish it later.'}
          {selectedStatus === 'archived' && '✓ Service will be hidden from buyers but kept in your records.'}
        </p>
      </div>

      {/* Review summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-100 p-2 space-y-1">
        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wide mb-1">Review before saving</p>
        {[
          ["Title",    title||"—"],
          ["Category", catLabel],
          ["Price",    d.price?`${d.price}`:"—"],
          ["Email",    d.email||"Not provided"],
          ["Status",   selectedStatus],
          ["Images",   [coverPreview1, coverPreview2].filter(Boolean).length > 0
            ? `${[coverPreview1,coverPreview2].filter(Boolean).length} uploaded`
            : "○ None (optional)"],
        ].map(([k,v])=>(
          <div key={k} className="flex items-center justify-between text-[9px]">
            <span className="text-gray-400">{k}</span>
            <span className={`font-medium ${k==='Status' && v==='published' ? 'text-[#1D4D4C]' : k==='Status' && v==='draft' ? 'text-[#EFB034]' : 'text-gray-700'}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// CATEGORIES
const CATEGORIES = [
  { id:"hotel",        label:"Hotels",    icon:<Hotel     size={12}/> },
  { id:"airline",      label:"Airlines",  icon:<Plane     size={12}/> },
  { id:"professional", label:"Services",  icon:<Briefcase size={12}/> },
  { id:"transport",    label:"Transport", icon:<Bike      size={12}/> },
];

// STEP INDICATOR
const STEP_LABELS = ["Basics", "Details", "Description", "Publish"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center w-full mb-2 shrink-0">
    {STEP_LABELS.map((label, i) => {
      const n = i+1, done = n < current, active = n === current;
      return (
        <React.Fragment key={n}>
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all
              ${done  ? "border-[#EFB034] text-white"
              : active ? "border-[#125852] text-white"
              : "bg-white border-gray-200 text-gray-400"}`}
              style={done?{backgroundColor:'#EFB034'}:active?{backgroundColor:'#125852'}:{}}>
              {done ? <CheckCircle size={10} className="text-white"/> : <span>{n}</span>}
            </div>
            <span className={`text-[8px] mt-0.5 font-medium whitespace-nowrap
              ${done?"text-[#EFB034]":active?"text-[#125852]":"text-gray-300"}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length-1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${done?"bg-[#EFB034]":"bg-gray-200"}`}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const validateImageFile = (file) => {
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return "Must be JPEG, PNG, or WebP.";
  if (file.size > 5 * 1024 * 1024) return "Max file size is 5 MB.";
  return null;
};

// MAIN COMPONENT
const ServiceForm = ({ onClose, editingListing }) => {
  const isEditing = !!editingListing;

  const [step,           setStep]          = useState(1);
  const [stepErrors,     setStepErrors]    = useState({});
  const [serviceType,    setServiceType]   = useState("");
  const [title,          setTitle]         = useState("");
  const [data,           setData]          = useState({});
  const [isLoading,      setIsLoading]     = useState(false);
  const [globalError,    setGlobalError]   = useState("");

  // Status chosen by vendor in Step 4
  // Default: 'published' for new services (same as before)
  // In edit mode: pre-fill from existing listing status
  const [selectedStatus, setSelectedStatus] = useState('published');

  const [coverImage1,    setCoverImage1]    = useState(null);
  const [coverPreview1,  setCoverPreview1]  = useState(null);
  const [coverImage2,    setCoverImage2]    = useState(null);
  const [coverPreview2,  setCoverPreview2]  = useState(null);

  const fileRef1 = useRef(null);
  const fileRef2 = useRef(null);

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

  // Pre-fill from vendor profile
  useEffect(() => {
    api.get('/accounts/register-vendor/')
      .then(res => {
        const p = res.data?.data || res.data || {};
        setData(prev => ({
          ...prev,
          phone:   p.business_phone  || p.phone_number || prev.phone   || '',
          address: p.address         || prev.address || '',
          city:    p.city            || prev.city    || '',
          country: p.country         || prev.country || '',
          email:   p.business_email  || p.email      || prev.email   || '',
          driver:  p.owner_full_name || p.owner_name || prev.driver  || '',
        }));
      }).catch(() => {});
  }, []);

  // Pre-fill from editingListing
  useEffect(() => {
    if (!editingListing) return;
    setTitle(editingListing.title || '');

    // Set the status from the existing listing so vendor can change it
    setSelectedStatus(editingListing.status || 'published');

    const bc = editingListing.business_category;
    if (bc === 'hotels')          setServiceType('hotel');
    else if (bc === 'airlines')   setServiceType('airline');
    else if (bc === 'transport')  setServiceType('transport');
    else                          setServiceType('professional');

    const det = editingListing.detail || {};
    setData(prev => ({
      ...prev,
      price:         editingListing.price   || '',
      description:   editingListing.description || '',
      availability:  editingListing.availability || 'available',
      address:       editingListing.location || prev.address || '',
      phone:         editingListing.contact_phone || prev.phone || '',
      email:         editingListing.contact_email || prev.email || '',
      propertyType:  det.property_type || '',
      stars:         det.star_rating   || '',
      roomCategory:  det.rooms?.[0]?.room_type || '',
      maxGuests:     det.rooms?.[0]?.max_adults || '',
      totalRooms:    det.rooms?.[0]?.rooms_available || '',
      checkIn:       det.check_in_time  || '',
      checkOut:      det.check_out_time || '',
      amenities:     det.amenities || [],
      serviceType:   det.service_type  || '',
      flightCode:    det.flight_number || '',
      origin:        det.origin        || '',
      destinations:  det.destination   || '',
      flightDuration:det.flight_duration || '',
      capacity:      det.seat_classes?.[0]?.seats_available || '',
      cabinClass:    det.seat_classes?.[0]?.seat_class || '',
      iata:          det.iata_code || '',
      vehicleType:   det.vehicle_type         || '',
      vehicleModel:  det.vehicle_model        || '',
      plate:         det.vehicle_number_plate || '',
      serviceMode:   det.service_mode         || '',
      driver:        det.driver_name          || prev.driver || '',
      seats:         det.seats_available      || '',
      available24h:  det.available_24h || false,
      routes:        det.origin || '',
      category:      det.sub_category || (bc === 'tailoring' ? 'tailoring' : ''),
      fabricMaterial:det.fabric_material || '',
      duration:      det.duration || (det.duration_days ? String(det.duration_days) : ''),
      languages:     det.languages || '',
      remote:        det.is_remote || (det.delivery_mode === 'remote'),
      platform:      det.platform_url || '',
      inclusions:    det.inclusions || [],
      priceUnit:     editingListing.price_unit || det.price_unit || 'session',
    }));

    if (editingListing.images?.length > 0) setCoverPreview1(editingListing.images[0]?.image || null);
    if (editingListing.images?.length > 1) setCoverPreview2(editingListing.images[1]?.image || null);
  }, [editingListing]);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const goNext = () => {
    const errs = validateStep(step, serviceType, title, data);
    if (Object.keys(errs).length > 0) { setStepErrors(errs); return; }
    setStepErrors({});
    setStep(s => Math.min(4, s+1));
  };
  const goBack = () => { setStepErrors({}); setStep(s => Math.max(1, s-1)); };

  const handleImageChange = (slotNum, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setStepErrors(p => ({ ...p, [`image${slotNum}`]: err })); return; }
    const url = URL.createObjectURL(file);
    if (slotNum === 1) { setCoverImage1(file); setCoverPreview1(url); }
    else               { setCoverImage2(file); setCoverPreview2(url); }
    setStepErrors(p => { const n={...p}; delete n[`image${slotNum}`]; return n; });
  };

  const handleSubmit = async () => {
    const { step: errStep, errors } = validateAllSteps(serviceType, title, data);
    if (errStep) { setStep(errStep); setStepErrors(errors); return; }

    setIsLoading(true);
    setGlobalError('');

    try {
      const enrichedData = { ...data, category_id: categoryMap[data.category] || undefined };
      // Build the payload with the vendor-selected status
      const payload = {
        ...buildListingPayload(serviceType, title, enrichedData),
        status: selectedStatus, // Override the default 'published' with the vendor's choice
      };

      let listingId;
      if (isEditing) {
        await api.patch(`/listings/${editingListing.id}/`, payload);
        listingId = editingListing.id;
      } else {
        const res = await api.post('/listings/', payload);
        const newListing = res.data?.data || res.data;
        listingId = newListing?.id;
      }

      // Upload images (only new File objects, not existing URLs)
      if (listingId) {
        if (coverImage1 instanceof File) await uploadListingImage(listingId, coverImage1);
        if (coverImage2 instanceof File) await uploadListingImage(listingId, coverImage2);
      }

      // onClose(true) tells ServiceManagement to refresh the grid.
      // It does NOT navigate. If you see a redirect to /products,
      // check your App.jsx router — the issue is there, not here.
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
          "Failed to save. Check your connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Label on the submit button changes based on selected status
  const submitLabel = {
    published: isEditing ? 'Save & Publish' : 'Publish Service',
    draft:     isEditing ? 'Save as Draft'  : 'Save as Draft',
    archived:  isEditing ? 'Save & Archive' : 'Archive',
  }[selectedStatus] || 'Save';

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {isEditing ? "Edit Service" : {1:"New Service",2:"Configure Service",3:"Description",4:"Review & Save"}[step]}
          </h3>
          <p className="text-[9px] text-gray-400">
            {{1:"Choose a category and give your service a title.",
              2:"Fill in the key details for this listing.",
              3:"Write up to 20 words about your service.",
              4:"Set status, upload images, and save."}[step]}
          </p>
        </div>
        <button onClick={() => onClose?.(false)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
          <X size={12}/>
        </button>
      </div>

      {/* Step indicator */}
      <div className="px-4 pb-0 shrink-0"><StepIndicator current={step}/></div>

      {/* Global error */}
      {globalError && (
        <div className="mx-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg text-[9px] mb-1 shrink-0">
          <AlertCircle size={10} className="shrink-0 mt-0.5"/><span className="flex-1">{globalError}</span>
          <button onClick={() => setGlobalError("")} className="ml-auto shrink-0"><X size={10}/></button>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-3">
            <Field label="Service Title" required error={stepErrors.title}>
              <div className="relative">
                <FileText className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                <input className={`${iCls_icon} ${stepErrors.title?"border-red-300 focus:ring-red-400 focus:border-red-400":""}`}
                  placeholder="e.g. Executive Business Coaching" value={title} onChange={e=>setTitle(e.target.value)} autoFocus/>
              </div>
            </Field>
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Select Category <span className="text-red-400">*</span>
              </label>
              {stepErrors.category && (
                <p className="text-[9px] text-red-500 flex items-center gap-1 mb-1"><AlertCircle size={8}/> {stepErrors.category}</p>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map(cat => {
                  const active = serviceType === cat.id;
                  return (
                    <button key={cat.id} type="button" onClick={() => setServiceType(cat.id)}
                      className={`relative flex flex-col items-center justify-center p-1.5 h-10 rounded-lg border-2 transition-all
                        ${active ? "border-[#EFB034] bg-[#EFB034]/10 text-[#C8900A]" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}>
                      {active && <CheckCircle2 className="absolute top-0.5 right-0.5 text-[#EFB034]" size={8}/>}
                      <span className={active ? "text-[#C8900A]" : "text-gray-400"}>{cat.icon}</span>
                      <span className="text-[8px] font-medium mt-0.5 uppercase tracking-tight">{cat.label}</span>
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
            <p className="text-[8px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
              <AlertCircle size={8}/> Fields with an orange ring were pre-filled from your profile. You can edit them.
            </p>
            {serviceType === "professional" && <ProfessionalStep2 d={data} set={set} errors={stepErrors}/>}
            {serviceType === "hotel"        && <HotelStep2        d={data} set={set} errors={stepErrors}/>}
            {serviceType === "airline"      && <AirlineStep2      d={data} set={set} errors={stepErrors}/>}
            {serviceType === "transport"    && <TransportStep2    d={data} set={set} errors={stepErrors}/>}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && <Step3Content serviceType={serviceType} d={data} set={set} errors={stepErrors}/>}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <Step4Content
              serviceType={serviceType} title={title} d={data} set={set}
              coverPreview1={coverPreview1} coverPreview2={coverPreview2}
              onImage1Click={() => fileRef1.current?.click()}
              onImage2Click={() => fileRef2.current?.click()}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
            <input ref={fileRef1} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>handleImageChange(1,e)}/>
            <input ref={fileRef2} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>handleImageChange(2,e)}/>
            {stepErrors.image1 && <p className="text-[9px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={8}/> Image 1: {stepErrors.image1}</p>}
            {stepErrors.image2 && <p className="text-[9px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={8}/> Image 2: {stepErrors.image2}</p>}
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 shrink-0">
        {step === 1 ? (
          <button onClick={() => onClose?.(false)}
            className="px-3 py-1 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-[11px] hover:bg-gray-50">
            Cancel
          </button>
        ) : (
          <button onClick={goBack} disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-[11px] hover:bg-gray-50 disabled:opacity-40">
            <ChevronLeft size={11}/> Back
          </button>
        )}
        <span className="text-[9px] text-gray-400 font-medium">{step} / 4</span>
        {step < 4 ? (
          <button onClick={goNext}
            className="flex items-center gap-1 px-4 py-1 rounded-lg text-[11px] font-medium text-white transition-all active:scale-95"
            style={{ backgroundColor:"#EFB034" }}>
            Next <ChevronRight size={11}/>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isLoading}
            className={`flex items-center gap-1 px-4 py-1 rounded-lg text-[11px] font-medium text-white transition-all active:scale-95 disabled:opacity-50
              ${selectedStatus === 'published' ? 'bg-[#EFB034] hover:bg-[#EFB034]/90'
              : selectedStatus === 'draft'     ? 'bg-[#1D4D4C] hover:bg-[#1D4D4C]/90'
              : 'bg-gray-500 hover:bg-gray-600'}`}>
            {isLoading
              ? <><Loader2 size={11} className="animate-spin"/> Saving…</>
              : <><CheckCircle size={11}/> {submitLabel}</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceForm;