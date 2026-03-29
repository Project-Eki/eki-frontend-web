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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI ATOMS — Compact version with balanced layouts
// ─────────────────────────────────────────────────────────────────────────────

const Field = ({ label, required, hint, error, children }) => (
  <div className="space-y-0.5">
    <label className="block text-[11px] font-medium text-gray-700">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
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

// Compact input classes - fixed focus ring visibility
const iCls =
  "w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034FF] focus:border-[#EFB034FF] transition-all placeholder:text-gray-400";
const iCls_icon =
  "w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#EFB034FF] focus:border-[#EFB034FF] transition-all placeholder:text-gray-400";

const InputIcon = ({ icon: Icon, error, ...props }) => (
  <div className="relative">
    <Icon
      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
      size={12}
    />
    <input
      className={`${iCls_icon} ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
      {...props}
    />
  </div>
);

const Select = ({ error, children, ...props }) => (
  <div className="relative">
    <select
      className={`${iCls} appearance-none pr-6 cursor-pointer ${error ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={11}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
    <div>
      <p className="text-[11px] font-medium text-gray-800">{label}</p>
      {desc && <p className="text-[9px] text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="shrink-0 ml-2"
    >
      {checked ? (
        <ToggleRight size={24} className="text-[#EFB034FF]" />
      ) : (
        <ToggleLeft size={24} className="text-gray-300" />
      )}
    </button>
  </div>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1.5 text-[10px] text-gray-600 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-3 h-3 accent-[#EFB034FF] rounded"
    />
    {label}
  </label>
);

// Section header — all use same color (#EFB034FF)
const SectionHeader = ({ icon: Icon, label }) => {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium mb-2 bg-[#EFB034]/10 border-[#EFB034]/20 text-[#EFB034FF]`}
    >
      <Icon size={12} /> {label}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 SUB-FORMS — Balanced grid layout
// ─────────────────────────────────────────────────────────────────────────────

const ProfessionalStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <SectionHeader icon={Briefcase} label="SERVICE CONFIGURATION" />
    </div>
    <Field label="Category" required error={errors.category}>
      <Select
        value={d.category || ""}
        onChange={(e) => set("category", e.target.value)}
        error={errors.category}
      >
        <option value="">Select category</option>
        <option value="retail">Retail</option>
        <option value="fashion">Fashion & Apparel</option>
        <option value="electronics">Electronics</option>
        <option value="food">Food & Beverages</option>
        <option value="beauty">Beauty & Health</option>
        <option value="home">Home & Garden</option>
        <option value="sports">Sports & Outdoors</option>
        <option value="automotive">Automotive</option>
        <option value="tailoring">Tailoring</option>
        <option value="other">Other</option>
      </Select>
    </Field>
    <Field label="Base Price ($)" required error={errors.price}>
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
      <Select
        value={d.priceUnit || "session"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="session">Per Session</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
        <option value="project">Per Project</option>
        <option value="month">Per Month</option>
      </Select>
    </Field>
    <Field label="Duration">
      <InputIcon
        icon={Clock}
        placeholder="e.g. 60 min"
        value={d.duration || ""}
        onChange={(e) => set("duration", e.target.value)}
      />
    </Field>
    <Field label="Availability">
      <Select
        value={d.availability || "available"}
        onChange={(e) => set("availability", e.target.value)}
      >
        <option value="available">Available Now</option>
        <option value="limited">Limited Slots</option>
        <option value="booked">Fully Booked</option>
        <option value="by_request">By Request Only</option>
      </Select>
    </Field>
    <Field label="Languages">
      <InputIcon
        icon={Globe}
        placeholder="English, French…"
        value={d.languages || ""}
        onChange={(e) => set("languages", e.target.value)}
      />
    </Field>
    {d.category === "tailoring" && (
      <Field
        label="Fabric Material"
        required
        error={errors.fabricMaterial}
        hint="Required for tailoring"
      >
        <InputIcon
          icon={Scissors}
          placeholder="e.g. Wool blend, Cotton"
          value={d.fabricMaterial || ""}
          onChange={(e) => set("fabricMaterial", e.target.value)}
          error={errors.fabricMaterial}
        />
      </Field>
    )}
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

const HotelStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <SectionHeader icon={Hotel} label="HOTEL CONFIGURATION" />
    </div>
    <Field label="Property Type" required error={errors.propertyType}>
      <Select
        value={d.propertyType || ""}
        onChange={(e) => set("propertyType", e.target.value)}
        error={errors.propertyType}
      >
        <option value="">Select type</option>
        <option>Hotel</option>
        <option>Lodge</option>
        <option>Guesthouse</option>
        <option>Airbnb / Short-Stay</option>
        <option>Resort</option>
        <option>Hostel</option>
        <option>Serviced Apartment</option>
        <option>Villa</option>
      </Select>
    </Field>
    <Field label="Star Rating">
      <Select
        value={d.stars || ""}
        onChange={(e) => set("stars", e.target.value)}
      >
        <option value="">Select</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} Star{n > 1 ? "s" : ""}
          </option>
        ))}
        <option value="unrated">Unrated</option>
      </Select>
    </Field>
    <Field label="Price / Night ($)" required error={errors.price}>
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
      <Select
        value={d.roomCategory || ""}
        onChange={(e) => set("roomCategory", e.target.value)}
        error={errors.roomCategory}
      >
        <option value="">Select room</option>
        <option>Standard Room</option>
        <option>Deluxe Room</option>
        <option>Suite</option>
        <option>Executive Room</option>
        <option>Family Room</option>
        <option>Penthouse</option>
        <option>Entire Unit</option>
      </Select>
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
        placeholder="e.g. 24"
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
        <InputIcon
          icon={MapPin}
          placeholder="Street, City, Country"
          value={d.address || ""}
          onChange={(e) => set("address", e.target.value)}
          error={errors.address}
        />
      </Field>
    </div>
    <Field label="Phone">
      <InputIcon
        icon={Phone}
        placeholder="+256 700 000 000"
        value={d.phone || ""}
        onChange={(e) => set("phone", e.target.value)}
      />
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
    <div className="col-span-2">
      <Field label="Website" hint="Optional">
        <InputIcon
          icon={Globe}
          type="url"
          placeholder="https://www.yourhotel.com"
          value={d.website || ""}
          onChange={(e) => set("website", e.target.value)}
        />
      </Field>
    </div>
    <div className="col-span-2">
      <Field label="Cancellation Policy">
        <Select
          value={d.cancellation || ""}
          onChange={(e) => set("cancellation", e.target.value)}
        >
          <option value="">Select policy</option>
          <option>Free cancellation up to 24 hours</option>
          <option>Free cancellation up to 48 hours</option>
          <option>Free cancellation up to 7 days</option>
          <option>Non-refundable</option>
          <option>Partial refund (50%)</option>
        </Select>
      </Field>
    </div>
  </div>
);

const AirlineStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <SectionHeader icon={Plane} label="FLIGHT SPECIFICATIONS" />
    </div>
    <Field label="Service Type" required error={errors.serviceType}>
      <Select
        value={d.serviceType || ""}
        onChange={(e) => set("serviceType", e.target.value)}
        error={errors.serviceType}
      >
        <option value="">Select type</option>
        <option>Scheduled Flight</option>
        <option>Charter Flight</option>
        <option>Cargo Service</option>
        <option>Helicopter Transfer</option>
        <option>Private Jet</option>
        <option>Travel Agency / Ticketing</option>
      </Select>
    </Field>
    <Field label="Flight Code">
      <input
        className={iCls}
        placeholder="e.g. UG-202"
        value={d.flightCode || ""}
        onChange={(e) => set("flightCode", e.target.value)}
      />
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
    <Field label="Price / Seat ($)" required error={errors.price}>
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
      <Select
        value={d.cabinClass || ""}
        onChange={(e) => set("cabinClass", e.target.value)}
      >
        <option value="">Select</option>
        <option>Economy</option>
        <option>Premium Economy</option>
        <option>Business Class</option>
        <option>First Class</option>
        <option>All Classes</option>
      </Select>
    </Field>
    <Field label="Duration">
      <InputIcon
        icon={Clock}
        placeholder="e.g. 1h 45min"
        value={d.flightDuration || ""}
        onChange={(e) => set("flightDuration", e.target.value)}
      />
    </Field>
    <Field label="Frequency">
      <Select
        value={d.frequency || ""}
        onChange={(e) => set("frequency", e.target.value)}
      >
        <option value="">Select</option>
        <option>Daily</option>
        <option>Several times a week</option>
        <option>Weekly</option>
        <option>On Demand / Charter</option>
        <option>Seasonal</option>
      </Select>
    </Field>
    <Field label="Seats">
      <InputIcon
        icon={User}
        type="number"
        placeholder="e.g. 180"
        value={d.capacity || ""}
        onChange={(e) => set("capacity", e.target.value)}
      />
    </Field>
    <Field label="IATA Code">
      <input
        className={iCls}
        placeholder="e.g. EK, QR"
        value={d.iata || ""}
        onChange={(e) => set("iata", e.target.value)}
      />
    </Field>
    <Field label="Contact Phone">
      <InputIcon
        icon={Phone}
        placeholder="+256 700 000 000"
        value={d.phone || ""}
        onChange={(e) => set("phone", e.target.value)}
      />
    </Field>
    <Field label="Booking Email">
      <InputIcon
        icon={Mail}
        type="email"
        placeholder="bookings@airline.com"
        value={d.email || ""}
        onChange={(e) => set("email", e.target.value)}
      />
    </Field>
    <div className="col-span-2">
      <Field label="Cancellation Policy">
        <Select
          value={d.cancellation || ""}
          onChange={(e) => set("cancellation", e.target.value)}
        >
          <option value="">Select policy</option>
          <option>Free cancellation within 24 hours</option>
          <option>Free cancellation 48 hours before departure</option>
          <option>Non-refundable</option>
          <option>Partial refund minus fees</option>
          <option>Fully Flexible</option>
        </Select>
      </Field>
    </div>
  </div>
);

const TransportStep2 = ({ d, set, errors }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <SectionHeader icon={Car} label="TRANSPORT CONFIGURATION" />
    </div>
    <Field label="Vehicle Type" required error={errors.vehicleType}>
      <Select
        value={d.vehicleType || ""}
        onChange={(e) => set("vehicleType", e.target.value)}
        error={errors.vehicleType}
      >
        <option value="">Select type</option>
        <option>Motorcycle (Boda Boda)</option>
        <option>Tuktuk / Bajaj</option>
        <option>Saloon Car</option>
        <option>SUV / 4×4</option>
        <option>Minibus / Taxi</option>
        <option>Bus / Coach</option>
        <option>Truck / Pickup</option>
        <option>Ambulance</option>
        <option>Other</option>
      </Select>
    </Field>
    <Field label="Service Mode" required error={errors.serviceMode}>
      <Select
        value={d.serviceMode || ""}
        onChange={(e) => set("serviceMode", e.target.value)}
        error={errors.serviceMode}
      >
        <option value="">Select mode</option>
        <option>Ride Hailing (On Demand)</option>
        <option>Airport Transfer</option>
        <option>Daily Car Hire</option>
        <option>Long Distance / Intercity</option>
        <option>Parcel Delivery</option>
        <option>School / Event Shuttle</option>
      </Select>
    </Field>
    <Field label="Price ($)" required error={errors.price}>
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
      <Select
        value={d.priceUnit || "trip"}
        onChange={(e) => set("priceUnit", e.target.value)}
      >
        <option value="trip">Per Trip</option>
        <option value="km">Per KM</option>
        <option value="hour">Per Hour</option>
        <option value="day">Per Day</option>
      </Select>
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
        placeholder="e.g. 4"
        value={d.seats || ""}
        onChange={(e) => set("seats", e.target.value)}
      />
    </Field>
    <Field label="Vehicle Model">
      <input
        className={iCls}
        placeholder="e.g. Toyota Hiace 2020"
        value={d.vehicleModel || ""}
        onChange={(e) => set("vehicleModel", e.target.value)}
      />
    </Field>
    <Field label="Number Plate">
      <input
        className={iCls}
        placeholder="e.g. UAA 123B"
        value={d.plate || ""}
        onChange={(e) => set("plate", e.target.value)}
      />
    </Field>
    <Field label="Contact Phone" required error={errors.phone}>
      <InputIcon
        icon={Phone}
        placeholder="+256 700 000 000"
        value={d.phone || ""}
        onChange={(e) => set("phone", e.target.value)}
        error={errors.phone}
      />
    </Field>
    <Field label="Routes / Area">
      <InputIcon
        icon={MapPin}
        placeholder="e.g. Kampala – Entebbe"
        value={d.routes || ""}
        onChange={(e) => set("routes", e.target.value)}
      />
    </Field>
    <div className="col-span-2">
      <Toggle
        checked={!!d.available24h}
        onChange={(v) => set("available24h", v)}
        label="Available 24 / 7"
        desc="Around the clock, including weekends"
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Description + checkboxes (balanced layout with 3 columns)
// ─────────────────────────────────────────────────────────────────────────────
const Step3Content = ({ serviceType, d, set, errors }) => {
  const wc = countWords(d.description || "");
  const wcColor =
    wc > 20 ? "text-red-500" : wc > 0 ? "text-[#EFB034FF]" : "text-gray-400";

  const items = {
    hotel: [
      "Free WiFi", "Parking", "Swimming Pool", "Gym / Fitness", "Restaurant",
      "Bar / Lounge", "Airport Shuttle", "Conference Room", "Spa", "Room Service",
      "Air Conditioning", "Breakfast Included",
    ],
    professional: [
      "One-on-One", "Group Sessions", "Certificate Provided", "Materials Included",
      "Follow-up Session", "Online Resources",
    ],
    airline: [
      "Carry-on Baggage", "Checked Baggage", "Meals", "In-flight Entertainment",
      "WiFi", "Lounge Access", "Airport Transfer", "Travel Insurance",
    ],
    transport: [
      "Air Conditioning", "WiFi / Hotspot", "GPS Tracking", "Music System",
      "Child Seat Available", "Luggage Space", "Wheelchair Accessible",
      "Pet Friendly", "Intercity Routes", "24/7 Availability",
    ],
  }[serviceType] || [];

  const checkKey = serviceType === "hotel" ? "amenities" : "inclusions";
  const checkLabel = {
    hotel: "Amenities",
    airline: "Included in Ticket",
    transport: "Vehicle Features",
    professional: "What's Included",
  }[serviceType] || "Extras";

  return (
    <div className="space-y-4">
      <Field
        label="Service Description"
        required
        error={errors.description}
        hint={`Maximum 20 words — currently ${wc} word${wc === 1 ? "" : "s"}`}
      >
        <div className="relative">
          <textarea
            rows={4}
            placeholder="Describe your service (max 20 words)..."
            className={`${iCls} resize-none w-full ${errors.description ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
            value={d.description || ""}
            onChange={(e) => set("description", e.target.value)}
          />
          <span
            className={`absolute bottom-1.5 right-2 text-[9px] font-bold tabular-nums pointer-events-none ${wcColor}`}
          >
            {wc}/20
          </span>
        </div>
      </Field>

      {items.length > 0 && (
        <Field label={checkLabel}>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            {items.map((item) => (
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
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Cover image + review summary (Email replaces Words)
// ─────────────────────────────────────────────────────────────────────────────
const Step4Content = ({ serviceType, title, d, coverPreview, onImageClick }) => {
  const catLabel = {
    hotel: "Hotel",
    airline: "Airline",
    professional: "Service",
    transport: "Transport",
  }[serviceType] || "";

  return (
    <div className="space-y-4">
      <Field label="Cover Image" hint="JPG, PNG, or WebP — max 5 MB (optional)">
        <div
          onClick={onImageClick}
          className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#EFB034FF] transition-colors bg-gray-50"
        >
          {coverPreview ? (
            <div className="relative h-28">
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] font-bold">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center gap-1">
              <Image size={20} className="text-gray-300" />
              <p className="text-[10px] text-gray-400 font-semibold">
                Click to upload cover image
              </p>
            </div>
          )}
        </div>
      </Field>

      <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 space-y-1.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
          Review before publishing
        </p>
        {[
          ["Title", title || "—"],
          ["Category", catLabel],
          ["Price", d.price ? `$${d.price}` : "—"],
          ["Email", d.email || d.booking_email || "Not provided"],
          ["Image", coverPreview ? "✓ Uploaded" : "○ None (optional)"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">{k}</span>
            <span className="font-medium text-gray-700">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Categories with smaller icons - reduced card size
const CATEGORIES = [
  { id: "hotel", label: "Hotels", icon: <Hotel size={14} />, color: "teal" },
  { id: "airline", label: "Airlines", icon: <Plane size={14} />, color: "teal" },
  { id: "professional", label: "Services", icon: <Briefcase size={14} />, color: "teal" },
  { id: "transport", label: "Transport", icon: <Bike size={14} />, color: "teal" },
];

const CAT_ACTIVE = {
  teal: "border-[#EFB034FF] bg-[#EFB034]/10 text-[#EFB034FF]",
};
const CAT_ICON_ACTIVE = {
  teal: "text-[#EFB034FF]",
};

// STEP INDICATOR
const STEP_LABELS = ["Basics", "Details", "Description", "Publish"];
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-4 shrink-0">
    {STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <React.Fragment key={n}>
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium border-2 transition-all ${
                done
                  ? "bg-[#EFB034FF] border-[#EFB034FF] text-white"
                  : active
                    ? "bg-white border-[#EFB034FF] text-[#EFB034FF]"
                    : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {done ? <CheckCircle size={12} /> : n}
            </div>
            <span
              className={`text-[9px] mt-0.5 font-medium ${active ? "text-[#EFB034FF]" : done ? "text-[#EFB034]" : "text-gray-300"}`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`h-0.5 w-8 mb-5 mx-1 transition-colors ${done ? "bg-[#EFB034FF]" : "bg-gray-200"}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// MAIN COMPONENT
const ServiceForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileRef = useRef(null);

  const [categoryMap, setCategoryMap] = useState({});
  useEffect(() => {
    api
      .get("/listings/categories/")
      .then((res) => {
        const arr = res.data?.data || res.data || [];
        const map = {};
        (Array.isArray(arr) ? arr : []).forEach((c) => {
          map[c.slug] = c.id;
        });
        setCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const goNext = () => {
    const errs = validateStep(step, serviceType, title, data);
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStepErrors((p) => ({ ...p, image: "Must be JPEG, PNG, or WebP." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStepErrors((p) => ({ ...p, image: "Max file size is 5 MB." }));
      return;
    }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const { step: errorStep, errors } = validateAllSteps(serviceType, title, data);
    
    if (errorStep) {
      setStep(errorStep);
      setStepErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setGlobalError("");
    try {
      const enrichedData = {
        ...data,
        category_id: categoryMap[data.category] || undefined,
      };
      const payload = buildListingPayload(serviceType, title, enrichedData);
      const response = await createListing(payload);
      const newListing = response?.data || response;
      const listingId = newListing?.id;

      if (coverImage && listingId)
        await uploadListingImage(listingId, coverImage);
      onClose?.(true);
    } catch (err) {
      setGlobalError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to publish. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-5 overflow-hidden">
      <StepIndicator current={step} />

      <div className="mb-3 shrink-0">
        <h3 className="text-sm font-medium text-gray-900">
          {
            {
              1: "Create a new service",
              2: "Configure your service",
              3: "Write your description",
              4: "Review & publish",
            }[step]
          }
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {
            {
              1: "Name your service and choose a category.",
              2: "Fill in the key details for this listing.",
              3: "Write exactly 20 words about your service.",
              4: "Upload a cover image and publish.",
            }[step]
          }
        </p>
      </div>

      {globalError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-lg text-[10px] mb-2 shrink-0">
          <AlertCircle size={11} /> {globalError}
          <button onClick={() => setGlobalError("")} className="ml-auto">
            <X size={11} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Service Title" required error={stepErrors.title}>
              <div className="relative">
                <FileText
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={13}
                />
                <input
                  className={`${iCls_icon} ${stepErrors.title ? "border-red-300 focus:ring-red-400 focus:border-red-400" : ""}`}
                  placeholder="e.g. Executive Business Coaching"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </Field>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1.5">
                Select Category <span className="text-red-400">*</span>
              </label>
              {stepErrors.category && (
                <p className="text-[10px] text-red-500 flex items-center gap-1 mb-1">
                  <AlertCircle size={9} /> {stepErrors.category}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const active = serviceType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceType(cat.id)}
                      className={`relative flex flex-col items-center justify-center p-2 h-14 rounded-xl border-2 transition-all ${
                        active
                          ? CAT_ACTIVE[cat.color]
                          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {active && (
                        <CheckCircle2
                          className={`absolute top-1 right-1 ${CAT_ICON_ACTIVE[cat.color]}`}
                          size={10}
                        />
                      )}
                      <span className={active ? CAT_ICON_ACTIVE[cat.color] : "text-gray-400"}>
                        {cat.icon}
                      </span>
                      <span className="text-[9px] font-medium mt-0.5 uppercase tracking-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="overflow-y-auto pr-1 pb-2">
            {serviceType === "professional" && (
              <ProfessionalStep2 d={data} set={set} errors={stepErrors} />
            )}
            {serviceType === "hotel" && (
              <HotelStep2 d={data} set={set} errors={stepErrors} />
            )}
            {serviceType === "airline" && (
              <AirlineStep2 d={data} set={set} errors={stepErrors} />
            )}
            {serviceType === "transport" && (
              <TransportStep2 d={data} set={set} errors={stepErrors} />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="overflow-y-auto pr-1 pb-2">
            <Step3Content
              serviceType={serviceType}
              d={data}
              set={set}
              errors={stepErrors}
            />
          </div>
        )}

        {step === 4 && (
          <div className="overflow-y-auto pr-1 pb-2">
            <Step4Content
              serviceType={serviceType}
              title={title}
              d={data}
              coverPreview={coverPreview}
              onImageClick={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            {stepErrors.image && (
              <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={9} /> {stepErrors.image}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 shrink-0">
        {step === 1 ? (
          <button
            onClick={() => onClose?.(false)}
            className="px-4 py-2 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-xs hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={goBack}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 text-gray-600 font-medium rounded-lg text-xs hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={13} /> Back
          </button>
        )}

        <span className="text-[10px] text-gray-400 font-medium">
          {step} / 4
        </span>

        {step < 4 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-medium text-white transition-all active:scale-95"
            style={{ backgroundColor: "#EFB034" }}
          >
            Next <ChevronRight size={13} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-medium text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#EFB034" }}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Publishing…
              </>
            ) : (
              <>
                <CheckCircle size={13} /> Publish Service
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceForm;