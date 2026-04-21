import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Hotel,
  Plane,
  Briefcase,
  Bike,
  Globe,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  ChevronDown,
  Phone,
  Mail,
  Link,
  Car,
  User,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Scissors,
  Plus,
  Archive,
  Send,
  BookOpen,
  Sparkles,
  Edit,
} from "lucide-react";
import { uploadListingImage } from "../../services/api";
import api from "../../services/api";
import { buildListingPayload } from "../../utils/buildListingPayload";
import {
  countWords,
  validateStep,
  validateAllSteps,
} from "../../utils/ServiceFormValidation";
import { useVendor } from "../../context/useVendor";

// PHONE INPUT (optional dependency)
let PhoneInput = null;
try {
  PhoneInput = require("react-phone-input-2").default;
} catch (_) {}

// SHARED UI ATOMS
const Field = ({ label, required, hint, error, children }) => (
  <div className="space-y-0.5">
    <label className="block text-[10px] font-medium text-gray-700">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[9px] text-red-500 flex items-center gap-1">
        <AlertCircle size={8} /> {error}
      </p>
    )}
    {hint && !error && <p className="text-[8px] text-gray-400">{hint}</p>}
  </div>
);

const iCls =
  "w-full px-2 py-1 border border-gray-200 rounded-lg text-[11px] bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034] focus:border-[#EFB034] transition-all placeholder:text-gray-400";
const iCls_icon =
  "w-full pl-7 pr-2 py-1 border border-gray-200 rounded-lg text-[11px] bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034] focus:border-[#EFB034] transition-all placeholder:text-gray-400";

const InputIcon = ({ icon: Icon, error, ...props }) => (
  <div className="relative">
    <Icon
      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
      size={11}
    />
    <input
      className={`${iCls_icon} ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
      {...props}
    />
  </div>
);

const Sel = ({ error, children, ...props }) => (
  <div className="relative">
    <select
      className={`${iCls} appearance-none pr-6 cursor-pointer ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={10}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg border border-gray-100">
    <div>
      <p className="text-[10px] font-medium text-gray-800">{label}</p>
      {desc && <p className="text-[8px] text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="shrink-0 ml-2"
    >
      {checked ? (
        <ToggleRight size={20} className="text-[#EFB034]" />
      ) : (
        <ToggleLeft size={20} className="text-gray-300" />
      )}
    </button>
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1 text-[9px] text-gray-600 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-2.5 h-2.5 accent-[#EFB034] rounded"
    />
    {label}
  </label>
);

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium mb-1.5 bg-[#EFB034]/10 border-[#EFB034]/20 text-[#C8900A]">
    <Icon size={11} /> {label}
  </div>
);

const PhoneField = ({ value, onChange, error }) => {
  if (PhoneInput) {
    return (
      <PhoneInput
        country="ug"
        value={(value || "").replace(/^\+/, "")}
        onChange={(p) => onChange("+" + p)}
        inputClass={`!w-full !text-[11px] !border-gray-200 !rounded-lg !h-6 !pl-10 ${error ? "!border-red-300" : ""}`}
        buttonClass="!border-gray-200 !rounded-l-lg !bg-gray-50"
        containerClass="!w-full"
        specialLabel=""
        placeholder="+256 700 000 000"
      />
    );
  }
  return (
    <InputIcon
      icon={Phone}
      type="tel"
      placeholder="+256 700 000 000"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
};

// IMAGE UPLOAD SLOT
const ImageSlot = ({ preview, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex-1 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#EFB034] transition-colors bg-gray-50 min-h-[70px]"
  >
    {preview ? (
      <div className="relative h-[70px]">
        <img src={preview} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-[9px] font-bold">Click to change</p>
        </div>
      </div>
    ) : (
      <div className="h-[70px] flex flex-col items-center justify-center gap-0.5">
        <Plus size={14} className="text-gray-300" />
        <p className="text-[9px] text-gray-400 font-semibold text-center px-2">
          {label}
        </p>
      </div>
    )}
  </div>
);

// ==================== TAILORING SPECIFIC FORM ====================
const TailoringStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Scissors} label="TAILORING DETAILS" />
    </div>
    <Field label="Service Type" required error={errors.tailoringServiceType}>
      <Sel
        value={d.tailoringServiceType || "custom"}
        onChange={(e) => set("tailoringServiceType", e.target.value)}
        error={errors.tailoringServiceType}
      >
        <option value="custom">Custom Made</option>
        <option value="alterations">Alterations & Repairs</option>
        <option value="embroidery">Embroidery</option>
        <option value="rental">Rental / Hire</option>
      </Sel>
    </Field>
    <Field label="Base Price" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Price Unit">
      <Sel
        value={d.priceUnit || "item"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="item">Per Item</option>
        <option value="outfit">Per Outfit</option>
        <option value="hour">Per Hour</option>
        <option value="project">Per Project</option>
      </Sel>
    </Field>
    <Field label="Fabric Material" required error={errors.fabricMaterial}>
      <InputIcon
        icon={Scissors}
        placeholder="e.g. Cotton, Silk, Wool blend"
        value={d.fabricMaterial || ""}
        onChange={(e) => set("fabricMaterial", e.target.value)}
        error={errors.fabricMaterial}
      />
    </Field>
    <Field label="Turnaround Time">
      <InputIcon
        icon={Clock}
        placeholder="e.g. 3-5 days, 1 week"
        value={d.turnaroundTime || ""}
        onChange={(e) => set("turnaroundTime", e.target.value)}
      />
    </Field>
    <Field label="Measurements Required">
      <Sel
        value={d.measurementsRequired || "optional"}
        onChange={(e) => set("measurementsRequired", e.target.value)}
      >
        <option value="optional">Optional</option>
        <option value="required">Required</option>
        <option value="in_person">In-person fitting only</option>
      </Sel>
    </Field>
    <div className="col-span-2">
      <Toggle
        checked={!!d.homeService}
        onChange={(v) => set("homeService", v)}
        label="Home Service Available"
        desc="We come to your location for measurements and delivery"
      />
    </div>
    <Field label="Contact Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
  </div>
);

// ==================== BEAUTY & HEALTH SPECIFIC FORM ====================
const BeautyHealthStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Sparkles} label="BEAUTY & HEALTH SERVICES" />
    </div>
    <Field label="Service Category" required error={errors.beautyCategory}>
      <Sel
        value={d.beautyCategory || ""}
        onChange={(e) => set("beautyCategory", e.target.value)}
        error={errors.beautyCategory}
      >
        <option value="">Select category</option>
        <option value="hair">Hair Styling & Braiding</option>
        <option value="makeup">Makeup Artistry</option>
        <option value="skincare">Skincare & Facials</option>
        <option value="massage">Massage Therapy</option>
        <option value="nails">Nail Care</option>
        <option value="barber">Barber Services</option>
        <option value="bridal">Bridal Packages</option>
        <option value="wellness">Wellness & Spa</option>
      </Sel>
    </Field>
    <Field label="Base Price" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Price Unit">
      <Sel
        value={d.priceUnit || "session"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="session">Per Session</option>
        <option value="hour">Per Hour</option>
        <option value="person">Per Person</option>
        <option value="package">Package Deal</option>
      </Sel>
    </Field>
    <Field label="Duration">
      <InputIcon
        icon={Clock}
        placeholder="e.g. 60 min, 2 hours"
        value={d.duration || ""}
        onChange={(e) => set("duration", e.target.value)}
      />
    </Field>
    <Field label="Products Used">
      <InputIcon
        icon={Tag}
        placeholder="e.g. Organic, Professional brands"
        value={d.productsUsed || ""}
        onChange={(e) => set("productsUsed", e.target.value)}
      />
    </Field>
    <div className="col-span-2">
      <Toggle
        checked={!!d.mobileService}
        onChange={(v) => set("mobileService", v)}
        label="Mobile Service"
        desc="I come to your location"
      />
    </div>
    <div className="col-span-2">
      <Toggle
        checked={!!d.groupSessions}
        onChange={(v) => set("groupSessions", v)}
        label="Group Sessions Available"
        desc="For bridal parties, events, etc."
      />
    </div>
    <Field label="Contact Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
  </div>
);

// ==================== OTHER SERVICES FORM ====================
const OtherServicesStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Briefcase} label="SERVICE CONFIGURATION" />
    </div>
    <Field label="Service Sub-Category" required error={errors.otherCategory}>
      <Sel
        value={d.otherCategory || ""}
        onChange={(e) => set("otherCategory", e.target.value)}
        error={errors.otherCategory}
      >
        <option value="">Select sub-category</option>
        <option value="events">Events & Decoration</option>
        <option value="education">Education & Tutoring</option>
        <option value="consulting">Consulting & Coaching</option>
        <option value="it">IT & Technology</option>
        <option value="cleaning">Cleaning & Maintenance</option>
        <option value="photography">Photography & Videography</option>
        <option value="catering">Catering & Food Services</option>
        <option value="logistics">Logistics & Delivery</option>
        <option value="repair">Repair Services</option>
        <option value="other">Other / General Services</option>
      </Sel>
    </Field>
    <Field label="Base Price" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Price Unit">
      <Sel
        value={d.priceUnit || "session"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="session">Per Session</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
        <option value="project">Per Project</option>
        <option value="month">Per Month</option>
      </Sel>
    </Field>
    <Field label="Duration">
      <InputIcon
        icon={Clock}
        placeholder="e.g. 60 min, 2 days"
        value={d.duration || ""}
        onChange={(e) => set("duration", e.target.value)}
      />
    </Field>
    <Field label="Availability">
      <Sel
        value={d.availability || "available"}
        onChange={(e) => set("availability", e.target.value)}
      >
        <option value="available">Available Now</option>
        <option value="limited">Limited Slots</option>
        <option value="booked">Fully Booked</option>
        <option value="by_request">By Request Only</option>
      </Sel>
    </Field>
    <Field label="Languages">
      <InputIcon
        icon={Globe}
        placeholder="English, French…"
        value={d.languages || ""}
        onChange={(e) => set("languages", e.target.value)}
      />
    </Field>
    <Field label="Contact Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
    <div className="col-span-2">
      <Toggle
        checked={!!d.remote}
        onChange={(v) => set("remote", v)}
        label="Remote / Online offering"
        desc="Can be delivered via video call"
      />
    </div>
    {d.remote && (
      <div className="col-span-2">
        <Field label="Platform link" hint="Zoom, Calendly, etc.">
          <InputIcon
            icon={Link}
            placeholder="https://calendly.com/yourname"
            value={d.platform || ""}
            onChange={(e) => set("platform", e.target.value)}
          />
        </Field>
      </div>
    )}
  </div>
);

// ==================== HOTEL FORM (Hospitality) ====================
const HotelStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Hotel} label="HOSPITALITY CONFIGURATION" />
    </div>
    <Field label="Property Type" required error={errors.propertyType}>
      <Sel
        value={d.propertyType || ""}
        onChange={(e) => set("propertyType", e.target.value)}
        error={errors.propertyType}
      >
        <option value="">Select type</option>
        <option value="hotel">Hotel</option>
        <option value="lodge">Lodge</option>
        <option value="guesthouse">Guesthouse</option>
        <option value="airbnb">Airbnb / Short-Stay</option>
        <option value="resort">Resort</option>
        <option value="hostel">Hostel</option>
        <option value="serviced_apartment">Serviced Apartment</option>
        <option value="villa">Villa</option>
      </Sel>
    </Field>
    <Field label="Star Rating">
      <Sel value={d.stars || ""} onChange={(e) => set("stars", e.target.value)}>
        <option value="">Select</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} Star{n > 1 ? "s" : ""}
          </option>
        ))}
        <option value="unrated">Unrated</option>
      </Sel>
    </Field>
    <Field label="Price / Night" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Room Category" required error={errors.roomCategory}>
      <Sel
        value={d.roomCategory || ""}
        onChange={(e) => set("roomCategory", e.target.value)}
        error={errors.roomCategory}
      >
        <option value="">Select room</option>
        {[
          "Standard Room",
          "Deluxe Room",
          "Suite",
          "Executive Room",
          "Family Room",
          "Penthouse",
          "Entire Unit",
        ].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </Sel>
    </Field>
    <Field label="Max Guests">
      <InputIcon
        icon={User}
        type="number"
        placeholder="2"
        value={d.maxGuests || ""}
        onChange={(e) => set("maxGuests", e.target.value)}
      />
    </Field>
    <Field label="Total Rooms">
      <InputIcon
        icon={Tag}
        type="number"
        placeholder="24"
        value={d.totalRooms || ""}
        onChange={(e) => set("totalRooms", e.target.value)}
      />
    </Field>
    <Field label="Check-In">
      <input
        type="time"
        className={iCls}
        value={d.checkIn || ""}
        onChange={(e) => set("checkIn", e.target.value)}
      />
    </Field>
    <Field label="Check-Out">
      <input
        type="time"
        className={iCls}
        value={d.checkOut || ""}
        onChange={(e) => set("checkOut", e.target.value)}
      />
    </Field>
    <div className="col-span-2">
      <Field label="Address" required error={errors.address}>
        <div className="ring-1 ring-amber-300 rounded-lg">
          <InputIcon
            icon={MapPin}
            placeholder="Street, City, Country"
            value={d.address || ""}
            onChange={(e) => set("address", e.target.value)}
            error={errors.address}
          />
        </div>
      </Field>
    </div>
    <Field label="Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
    <Field label="Booking Email">
      <InputIcon
        icon={Mail}
        type="email"
        placeholder="reservations@hotel.com"
        value={d.email || ""}
        onChange={(e) => set("email", e.target.value)}
      />
    </Field>
  </div>
);

// ==================== AIRLINE FORM ====================
const AirlineStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Plane} label="FLIGHT SPECIFICATIONS" />
    </div>
    <Field label="Service Type" required error={errors.serviceType}>
      <Sel
        value={d.serviceType || ""}
        onChange={(e) => set("serviceType", e.target.value)}
        error={errors.serviceType}
      >
        <option value="">Select type</option>
        <option value="scheduled">Scheduled Flight</option>
        <option value="charter">Charter Flight</option>
        <option value="cargo">Cargo Service</option>
        <option value="helicopter">Helicopter Transfer</option>
        <option value="private_jet">Private Jet</option>
        <option value="ticketing">Travel Agency / Ticketing</option>
      </Sel>
    </Field>
    <Field label="Origin" required error={errors.origin}>
      <InputIcon
        icon={MapPin}
        placeholder="e.g. Entebbe (EBB)"
        value={d.origin || ""}
        onChange={(e) => set("origin", e.target.value)}
        error={errors.origin}
      />
    </Field>
    <Field label="Destination(s)" required error={errors.destinations}>
      <InputIcon
        icon={MapPin}
        placeholder="e.g. Nairobi, Dubai"
        value={d.destinations || ""}
        onChange={(e) => set("destinations", e.target.value)}
        error={errors.destinations}
      />
    </Field>
    <Field label="Price / Seat" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Cabin Class">
      <Sel
        value={d.cabinClass || ""}
        onChange={(e) => set("cabinClass", e.target.value)}
      >
        <option value="">Select</option>
        <option value="economy">Economy</option>
        <option value="premium_economy">Premium Economy</option>
        <option value="business">Business Class</option>
        <option value="first">First Class</option>
        <option value="all">All Classes</option>
      </Sel>
    </Field>
    <Field label="Contact Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
  </div>
);

// ==================== TRANSPORT FORM ====================
const TransportStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <div className="col-span-2">
      <SectionHeader icon={Car} label="TRANSPORT CONFIGURATION" />
    </div>
    <Field label="Vehicle Type" required error={errors.vehicleType}>
      <Sel
        value={d.vehicleType || ""}
        onChange={(e) => set("vehicleType", e.target.value)}
        error={errors.vehicleType}
      >
        <option value="">Select type</option>
        <option value="motorcycle">Motorcycle (Boda Boda)</option>
        <option value="tuktuk">Tuktuk / Bajaj</option>
        <option value="saloon_car">Saloon Car</option>
        <option value="suv">SUV / 4×4</option>
        <option value="minibus">Minibus / Taxi</option>
        <option value="bus">Bus / Coach</option>
        <option value="truck">Truck / Pickup</option>
        <option value="ambulance">Ambulance</option>
      </Sel>
    </Field>
    <Field label="Service Mode" required error={errors.serviceMode}>
      <Sel
        value={d.serviceMode || ""}
        onChange={(e) => set("serviceMode", e.target.value)}
        error={errors.serviceMode}
      >
        <option value="">Select mode</option>
        <option value="ride_hailing">Ride Hailing (On Demand)</option>
        <option value="airport_transfer">Airport Transfer</option>
        <option value="daily_hire">Daily Car Hire</option>
        <option value="long_distance">Long Distance / Intercity</option>
        <option value="parcel_delivery">Parcel Delivery</option>
        <option value="shuttle">School / Event Shuttle</option>
      </Sel>
    </Field>
    <Field label="Origin / Pickup" required error={errors.origin}>
      <InputIcon
        icon={MapPin}
        placeholder="e.g. Kampala, Entebbe Airport"
        value={d.origin || ""}
        onChange={(e) => set("origin", e.target.value)}
        error={errors.origin}
      />
    </Field>
    <Field label="Destination" required error={errors.destination}>
      <InputIcon
        icon={MapPin}
        placeholder="e.g. Murchison Falls, Queen Elizabeth"
        value={d.destination || ""}
        onChange={(e) => set("destination", e.target.value)}
        error={errors.destination}
      />
    </Field>
    <Field label="Price" required error={errors.price}>
      <InputIcon
        icon={DollarSign}
        type="number"
        placeholder="0.00"
        value={d.price || ""}
        onChange={(e) => set("price", e.target.value)}
        error={errors.price}
      />
    </Field>
    <Field label="Price Unit">
      <Sel
        value={d.priceUnit || "trip"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="trip">Per Trip</option>
        <option value="km">Per KM</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
      </Sel>
    </Field>
    <Field label="Driver Name">
      <InputIcon
        icon={User}
        placeholder="Full name"
        value={d.driver || ""}
        onChange={(e) => set("driver", e.target.value)}
      />
    </Field>
    <Field label="Seating Capacity">
      <InputIcon
        icon={User}
        type="number"
        placeholder="4"
        value={d.seats || ""}
        onChange={(e) => set("seats", e.target.value)}
      />
    </Field>
    <Field label="Number Plate" required error={errors.plate}>
      <input
        className={`${iCls} ${errors.plate ? "border-red-300" : ""}`}
        placeholder="e.g. UAA 123B"
        value={d.plate || ""}
        onChange={(e) => set("plate", e.target.value)}
      />
    </Field>
    <Field label="Contact Phone" required error={errors.phone}>
      <div className="ring-1 ring-amber-300 rounded-lg">
        <PhoneField
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
        />
      </div>
    </Field>
    <div className="col-span-2">
      <Toggle
        checked={!!d.available24h}
        onChange={(v) => set("available24h", v)}
        label="Available 24/7"
        desc="Around the clock, including weekends"
      />
    </div>
  </div>
);

// STEP 3 — Description + amenities/inclusions
const Step3Content = ({ serviceCategory, d, set, errors }) => {
  const wc = countWords(d.description || "");
  const wcColor =
    wc > 20 ? "text-red-500" : wc > 0 ? "text-[#C8900A]" : "text-gray-400";

  const getAmenities = () => {
    switch (serviceCategory) {
      case "hotel":
        return [
          "Free WiFi",
          "Parking",
          "Swimming Pool",
          "Restaurant",
          "Air Conditioning",
          "Breakfast Included",
        ];
      case "airline":
        return [
          "Carry-on Baggage",
          "Checked Baggage",
          "Meals",
          "In-flight Entertainment",
          "WiFi",
        ];
      case "transport":
        return [
          "Air Conditioning",
          "GPS Tracking",
          "Music System",
          "Luggage Space",
          "24/7 Availability",
        ];
      case "tailoring":
        return [
          "Free Consultation",
          "Fitting Included",
          "Delivery Available",
          "Alterations",
          "Fabric Swatches",
        ];
      case "beauty":
        return [
          "Products Included",
          "Sanitized Tools",
          "Free Consultation",
          "Aftercare Advice",
        ];
      default:
        return [
          "Professional Service",
          "Guaranteed Quality",
          "Customer Support",
        ];
    }
  };

  const checkKey = "inclusions";

  return (
    <div className="space-y-3 ml-0.5">
      <Field
        label="Service Description"
        required
        error={errors.description}
        hint={`Maximum 20 words — currently ${wc} word${wc === 1 ? "" : "s"}`}
      >
        <div className="relative">
          <textarea
            rows={3}
            placeholder="Describe your service (max 20 words)..."
            className={`${iCls} resize-none w-full`}
            value={d.description || ""}
            onChange={(e) => set("description", e.target.value)}
          />
          <span
            className={`absolute bottom-1 right-2 text-[8px] font-bold ${wcColor}`}
          >
            {wc}/20
          </span>
        </div>
      </Field>
      <Field label="What's Included">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-2 bg-gray-50 rounded-lg">
          {getAmenities().map((item) => (
            <Check
              key={item}
              label={item}
              checked={(d[checkKey] || []).includes(item)}
              onChange={(c) =>
                set(
                  checkKey,
                  c
                    ? [...(d[checkKey] || []), item]
                    : (d[checkKey] || []).filter((x) => x !== item),
                )
              }
            />
          ))}
        </div>
      </Field>
    </div>
  );
};

// STEP 4 — Images + Status selector + Review
const Step4Content = ({
  categoryLabel,
  title,
  d,
  coverPreview1,
  coverPreview2,
  onImage1Click,
  onImage2Click,
  selectedStatus,
  onStatusChange,
}) => (
  <div className="space-y-3">
    <Field
      label="Cover Images"
      hint="Upload up to 2 images — JPG, PNG, or WebP, max 5 MB each (optional)"
    >
      <div className="flex gap-2">
        <ImageSlot
          preview={coverPreview1}
          label="Primary Image"
          onClick={onImage1Click}
        />
        <ImageSlot
          preview={coverPreview2}
          label="Second Image (optional)"
          onClick={onImage2Click}
        />
      </div>
    </Field>

    <div>
      <p className="text-[10px] font-medium text-gray-700 mb-1.5">
        Listing Status
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onStatusChange("published")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${selectedStatus === "published" ? "border-[#EFB034] bg-[#1D4D4C]/10 text-[#EFB034]" : "border-gray-200 bg-white text-gray-500"}`}
        >
          <Send size={12} />{" "}
          <span className="text-[9px] font-bold">Publish</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("draft")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${selectedStatus === "draft" ? "border-[#1D4D4C] bg-[#1D4D4C]/10 text-[#1D4D4C]" : "border-gray-200 bg-white text-gray-500"}`}
        >
          <BookOpen size={12} />{" "}
          <span className="text-[9px] font-bold">Draft</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("archived")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${selectedStatus === "archived" ? "border-gray-500 bg-gray-100 text-gray-700" : "border-gray-200 bg-white text-gray-500"}`}
        >
          <Archive size={12} />{" "}
          <span className="text-[9px] font-bold">Archive</span>
        </button>
      </div>
    </div>

    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-[8px] font-bold text-gray-400 mb-1">
        Review before saving
      </p>
      {[
        ["Title", title || "—"],
        ["Category", categoryLabel],
        ["Price", d.price ? `${d.price}` : "—"],
        ["Status", selectedStatus],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between text-[9px]">
          <span className="text-gray-400">{k}</span>
          <span className="font-medium text-gray-700">{v}</span>
        </div>
      ))}
    </div>
  </div>
);

// STEP INDICATOR - UPDATED VERSION
const STEP_LABELS = ["Basics", "Details", "Description", "Publish"];
const StepIndicator = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEP_LABELS.map((label, idx) => {
      const stepNum = idx + 1;
      const isActive = stepNum === current;
      const isCompleted = stepNum < current;
      
      return (
        <React.Fragment key={stepNum}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                ${isCompleted 
                  ? "bg-[#EFB034] text-white" 
                  : isActive 
                    ? "bg-[#125852] text-white ring-2 ring-[#125852]/20" 
                    : "bg-gray-100 text-gray-400"
                }`}
            >
              {isCompleted ? <CheckCircle size={14} /> : stepNum}
            </div>
            <span className={`text-[11px] font-medium hidden sm:inline
              ${isActive ? "text-[#125852]" : isCompleted ? "text-[#EFB034]" : "text-gray-400"}
            `}>
              {label}
            </span>
          </div>
          {idx < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full ${isCompleted ? "bg-[#EFB034]" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const validateImageFile = (file) => {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "Must be JPEG, PNG, or WebP.";
  if (file.size > 5 * 1024 * 1024) return "Max file size is 5 MB.";
  return null;
};

// Helper to get category display name
const getCategoryDisplay = (category) => {
  const map = {
    tailoring: {
      label: "Tailoring",
      icon: <Scissors size={14} />,
      color: "text-purple-600",
    },
    beauty: {
      label: "Beauty & Health",
      icon: <Sparkles size={14} />,
      color: "text-pink-600",
    },
    hotels: {
      label: "Hospitality",
      icon: <Hotel size={14} />,
      color: "text-orange-600",
    },
    airlines: {
      label: "Airlines",
      icon: <Plane size={14} />,
      color: "text-blue-600",
    },
    transport: {
      label: "Transport",
      icon: <Car size={14} />,
      color: "text-green-600",
    },
    other: {
      label: "Other Services",
      icon: <Briefcase size={14} />,
      color: "text-gray-600",
    },
  };
  return map[category] || map["other"];
};

// MAIN COMPONENT
const ServiceForm = ({ onClose, editingListing }) => {
  const { businessCategory, vendorType } = useVendor();
  const isEditing = !!editingListing;

  const [step, setStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("published");
  const [coverImage1, setCoverImage1] = useState(null);
  const [coverPreview1, setCoverPreview1] = useState(null);
  const [coverImage2, setCoverImage2] = useState(null);
  const [coverPreview2, setCoverPreview2] = useState(null);
  const fileRef1 = useRef(null);
  const fileRef2 = useRef(null);

  // Available categories from vendor onboarding
  const availableCategories = useMemo(() => {
    if (!businessCategory) return [];
    const categories = [];
    if (Array.isArray(businessCategory)) {
      businessCategory.forEach((cat) => {
        if (getCategoryDisplay(cat)) categories.push(cat);
      });
    } else if (businessCategory && getCategoryDisplay(businessCategory)) {
      categories.push(businessCategory);
    }
    return categories;
  }, [businessCategory]);

  useEffect(() => {
    if (!isEditing && availableCategories.length === 1 && !selectedCategory) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, isEditing, selectedCategory]);

  useEffect(() => {
    api
      .get("/accounts/register-vendor/")
      .then((res) => {
        const p = res.data?.data || res.data || {};
        setData((prev) => ({
          ...prev,
          phone: p.business_phone || p.phone_number || prev.phone || "",
          address: p.address || prev.address || "",
          email: p.business_email || p.email || prev.email || "",
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editingListing) return;
    setTitle(editingListing.title || "");
    setSelectedStatus(editingListing.status || "published");
    const bc = editingListing.business_category;
    setSelectedCategory(
      bc === "hotels"
        ? "hotels"
        : bc === "airlines"
          ? "airlines"
          : bc === "transport"
            ? "transport"
            : bc === "tailoring"
              ? "tailoring"
              : bc === "beauty"
                ? "beauty"
                : "other",
    );
    const det = editingListing.detail || {};
    setData((prev) => ({
      ...prev,
      price: editingListing.price || "",
      description: editingListing.description || "",
      phone: editingListing.contact_phone || prev.phone || "",
      email: editingListing.contact_email || prev.email || "",
      ...det,
    }));
    if (editingListing.images?.length > 0)
      setCoverPreview1(editingListing.images[0]?.image || null);
    if (editingListing.images?.length > 1)
      setCoverPreview2(editingListing.images[1]?.image || null);
  }, [editingListing]);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const goNext = () => {
    const errs = validateStep(step, selectedCategory, title, data);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors({});
    setStep((s) => Math.min(4, s + 1));
  };
  const goBack = () => {
    setStepErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleImageChange = (slotNum, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setStepErrors((p) => ({ ...p, [`image${slotNum}`]: err }));
      return;
    }
    const url = URL.createObjectURL(file);
    if (slotNum === 1) {
      setCoverImage1(file);
      setCoverPreview1(url);
    } else {
      setCoverImage2(file);
      setCoverPreview2(url);
    }
    setStepErrors((p) => {
      const n = { ...p };
      delete n[`image${slotNum}`];
      return n;
    });
  };

  const handleSubmit = async () => {
    const { step: errStep, errors } = validateAllSteps(
      selectedCategory,
      title,
      data,
    );
    if (errStep) {
      setStep(errStep);
      setStepErrors(errors);
      return;
    }
    setIsLoading(true);
    setGlobalError("");
    try {
      const payload = {
        ...buildListingPayload(selectedCategory, title, data),
        status: selectedStatus,
      };
      let listingId;
      if (isEditing) {
        await api.patch(`/listings/${editingListing.id}/`, payload);
        listingId = editingListing.id;
      } else {
        const res = await api.post("/listings/", payload);
        listingId = res.data?.data?.id;
      }
      if (listingId) {
        if (coverImage1 instanceof File)
          await uploadListingImage(listingId, coverImage1);
        if (coverImage2 instanceof File)
          await uploadListingImage(listingId, coverImage2);
      }
      onClose?.(true);
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      setGlobalError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to save. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const submitLabel =
    {
      published: isEditing ? "Save & Publish" : "Publish Service",
      draft: isEditing ? "Save as Draft" : "Save as Draft",
      archived: isEditing ? "Save & Archive" : "Archive",
    }[selectedStatus] || "Save";
  const categoryDisplay = getCategoryDisplay(selectedCategory);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Header - Updated to match product form style */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex justify-between items-start shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Service" : "Add New Service"}
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {step === 1 && (
              <>Step 1 of 4 · {categoryDisplay?.label || "Select Category"}</>
            )}
            {step === 2 && <>Step 2 of 4 · Configure Service</>}
            {step === 3 && <>Step 3 of 4 · Description</>}
            {step === 4 && <>Step 4 of 4 · Images & Publish</>}
          </p>
        </div>
        <button
          onClick={() => onClose?.(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-3 pb-1">
        <StepIndicator current={step} />
      </div>

      {globalError && (
        <div className="mx-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[10px] mb-2">
          <AlertCircle size={12} />
          <span className="flex-1">{globalError}</span>
          <button onClick={() => setGlobalError("")}>
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {step === 1 && (
          <div className="space-y-4 px-1">
            {/* Category badge - like product form */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryDisplay.color} bg-opacity-10`} 
                  style={{ backgroundColor: `${categoryDisplay.color.replace('text-', '')}10` }}
                >
                  {categoryDisplay.label}
                </div>
                <span className="text-[10px] text-gray-400">Category</span>
              </div>
            )}
            
            <Field label="Service Title" required error={stepErrors.title}>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-[13px] outline-none focus:ring-1 focus:ring-[#EFB034] ${stepErrors.title ? "border-red-300" : "border-gray-200"}`}
                  placeholder="e.g. Custom Wedding Dress"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </Field>

            {/* Category selection - only show if no category selected yet */}
            {!selectedCategory && (
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1.5">
                  Select Category <span className="text-red-400">*</span>
                </label>
                {stepErrors.category && (
                  <p className="text-[10px] text-red-500 mb-2 flex items-center gap-1">
                    <AlertCircle size={10} /> {stepErrors.category}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map((cat) => {
                    const display = getCategoryDisplay(cat);
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                          ${active 
                            ? "border-[#EFB034] bg-[#EFB034]/5" 
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {active && (
                          <CheckCircle2
                            className="absolute top-2 right-2 text-[#EFB034]"
                            size={14}
                          />
                        )}
                        <span className={active ? "text-[#C8900A]" : "text-gray-500"}>
                          {display.icon}
                        </span>
                        <span className="text-[11px] font-medium mt-1.5">
                          {display.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Show selected category as badge with edit option */}
            {selectedCategory && (
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={categoryDisplay.color}>{categoryDisplay.icon}</span>
                    <span className="text-[12px] font-medium text-gray-700">
                      {categoryDisplay.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="text-[10px] text-gray-400 hover:text-[#EFB034] flex items-center gap-1"
                  >
                    <Edit size={10} /> Change
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedCategory && (
          <div>
            <p className="text-[8px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
              <AlertCircle size={8} /> Pre-filled fields from your profile can be edited.
            </p>
            {selectedCategory === "tailoring" && (
              <TailoringStep2 d={data} set={set} errors={stepErrors} />
            )}
            {selectedCategory === "beauty" && (
              <BeautyHealthStep2 d={data} set={set} errors={stepErrors} />
            )}
            {selectedCategory === "hotels" && (
              <HotelStep2 d={data} set={set} errors={stepErrors} />
            )}
            {selectedCategory === "airlines" && (
              <AirlineStep2 d={data} set={set} errors={stepErrors} />
            )}
            {selectedCategory === "transport" && (
              <TransportStep2 d={data} set={set} errors={stepErrors} />
            )}
            {selectedCategory === "other" && (
              <OtherServicesStep2 d={data} set={set} errors={stepErrors} />
            )}
          </div>
        )}

        {step === 3 && selectedCategory && (
          <Step3Content
            serviceCategory={selectedCategory}
            d={data}
            set={set}
            errors={stepErrors}
          />
        )}

        {step === 4 && selectedCategory && (
          <div>
            <Step4Content
              categoryLabel={categoryDisplay.label}
              title={title}
              d={data}
              coverPreview1={coverPreview1}
              coverPreview2={coverPreview2}
              onImage1Click={() => fileRef1.current?.click()}
              onImage2Click={() => fileRef2.current?.click()}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
            <input
              ref={fileRef1}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(1, e)}
            />
            <input
              ref={fileRef2}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(2, e)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 shrink-0">
        {step === 1 ? (
          <button
            onClick={() => onClose?.(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}
        <span className="text-[11px] text-gray-400 font-medium">
          {step} / 4
        </span>
        {step < 4 ? (
          <button
            onClick={goNext}
            disabled={!selectedCategory && step === 1}
            className={`flex items-center gap-1 px-5 py-2 rounded-lg text-[12px] font-medium text-white transition-all active:scale-95
              ${!selectedCategory && step === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#EFB034] hover:bg-[#E0A83B]"}`}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex items-center gap-1 px-5 py-2 rounded-lg text-[12px] font-medium text-white transition-all active:scale-95 disabled:opacity-50
              ${selectedStatus === "published" 
                ? "bg-[#EFB034] hover:bg-[#E0A83B]" 
                : selectedStatus === "draft" 
                  ? "bg-[#1D4D4C] hover:bg-[#16423E]" 
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={14} /> {submitLabel}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceForm;