import React, { useState } from 'react';
import {
  Hotel, Plane, Briefcase, Bike,
  Globe, MapPin, DollarSign, FileText,
  Clock, ToggleLeft, ToggleRight,
  CheckCircle2, ChevronDown, Phone, Mail, Link,
  Car, User, Tag, Image, X
} from 'lucide-react';
import { createListing, uploadListingImage } from "../../services/api";
import { buildListingPayload } from "../../utils/buildListingPayload";
// import { toast } from "react-hot-toast";  ← uncomment when you add toast


// ─────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const inputCls     = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400";
const iconInputCls = "w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400";

const InputIcon = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
    <input className={iconInputCls} {...props} />
  </div>
);

const Select = ({ children, ...props }) => (
  <div className="relative">
    <select className={`${inputCls} appearance-none pr-9 cursor-pointer`} {...props}>
      {children}
    </select>
    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!checked)} className="shrink-0 ml-4">
      {checked ? <ToggleRight size={36} className="text-teal-600" /> : <ToggleLeft size={36} className="text-gray-300" />}
    </button>
  </div>
);

const AmenityCheck = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-teal-600 rounded" />
    {label}
  </label>
);

const SectionHeader = ({ icon: Icon, label, color = "teal" }) => {
  const colors = { teal:"bg-teal-50 border-teal-100 text-teal-800", blue:"bg-blue-50 border-blue-100 text-blue-800", amber:"bg-amber-50 border-amber-100 text-amber-800", purple:"bg-purple-50 border-purple-100 text-purple-800" };
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold italic mb-4 ${colors[color]}`}>
      <Icon size={16}/> {label}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// SUB-FORMS — unchanged UI, just rendering fields
// ─────────────────────────────────────────────────────────────
const ProfessionalFields = ({ d, set }) => {
  const amenities = ["One-on-One","Group Sessions","Certificate Provided","Materials Included","Follow-up Session","Online Resources"];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Briefcase} label="SERVICE CONFIGURATION" color="purple" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Category" required>
          <Select value={d.category||""} onChange={e=>set("category",e.target.value)}>
            <option value="">Select category</option>
            <option>Consulting</option><option>Coaching</option><option>Creative</option>
            <option>IT Services</option><option>Legal</option><option>Finance</option>
            <option>Marketing</option><option>Education & Training</option>
            <option>Health & Wellness</option><option>Home & Living</option><option>Other</option>
          </Select>
        </Field>
        <Field label="Base Price ($)" required>
          <InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)}/>
        </Field>
        <Field label="Service Duration">
          <InputIcon icon={Clock} placeholder="e.g. 60 min" value={d.duration||""} onChange={e=>set("duration",e.target.value)}/>
        </Field>
        <Field label="Initial Availability">
          <Select value={d.availability||"available"} onChange={e=>set("availability",e.target.value)}>
            <option value="available">Available Now</option>
            <option value="limited">Limited Slots</option>
            <option value="booked">Fully Booked</option>
            <option value="by_request">By Request Only</option>
          </Select>
        </Field>
        <Field label="Price Unit">
          <Select value={d.priceUnit||"session"} onChange={e=>set("priceUnit",e.target.value)}>
            <option value="session">Per Session</option><option value="hour">Per Hour</option>
            <option value="day">Per Day</option><option value="project">Per Project</option><option value="month">Per Month</option>
          </Select>
        </Field>
        <Field label="Languages Offered">
          <InputIcon icon={Globe} placeholder="e.g. English, French" value={d.languages||""} onChange={e=>set("languages",e.target.value)}/>
        </Field>
      </div>
      <Field label="Service Description" required>
        <textarea rows={4} placeholder="Describe what your service offers..." className={`${inputCls} resize-none`} value={d.description||""} onChange={e=>set("description",e.target.value)}/>
      </Field>
      <Field label="What's Included">
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {amenities.map(a => (
            <AmenityCheck key={a} label={a} checked={(d.inclusions||[]).includes(a)}
              onChange={c => set("inclusions", c ? [...(d.inclusions||[]),a] : (d.inclusions||[]).filter(x=>x!==a))}/>
          ))}
        </div>
      </Field>
      <Toggle checked={!!d.remote} onChange={v=>set("remote",v)} label="Remote Offering" desc="This service can be delivered online." />
      {d.remote && (
        <Field label="Platform / Meeting Link" hint="e.g. Zoom, Google Meet, Calendly">
          <InputIcon icon={Link} placeholder="https://calendly.com/yourname" value={d.platform||""} onChange={e=>set("platform",e.target.value)}/>
        </Field>
      )}
    </div>
  );
};

const HotelFields = ({ d, set }) => {
  const amenities = ["Free WiFi","Parking","Swimming Pool","Gym / Fitness","Restaurant","Bar / Lounge","Airport Shuttle","Conference Room","Spa","Room Service","Air Conditioning","Breakfast Included"];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Hotel} label="HOTEL CONFIGURATION" color="teal" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Property Type" required>
          <Select value={d.propertyType||""} onChange={e=>set("propertyType",e.target.value)}>
            <option value="">Select type</option>
            <option>Hotel</option><option>Lodge</option><option>Guesthouse</option>
            <option>Airbnb / Short-Stay</option><option>Resort</option><option>Hostel</option><option>Serviced Apartment</option><option>Villa</option>
          </Select>
        </Field>
        <Field label="Star Rating">
          <Select value={d.stars||""} onChange={e=>set("stars",e.target.value)}>
            <option value="">Select rating</option>
            {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
            <option value="unrated">Unrated / Boutique</option>
          </Select>
        </Field>
        <Field label="Price per Night ($)" required>
          <InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)}/>
        </Field>
        <Field label="Room Category" required>
          <Select value={d.roomCategory||""} onChange={e=>set("roomCategory",e.target.value)}>
            <option value="">Select room type</option>
            <option>Standard Room</option><option>Deluxe Room</option><option>Suite</option>
            <option>Executive Room</option><option>Family Room</option><option>Penthouse</option><option>Entire Unit</option>
          </Select>
        </Field>
        <Field label="Max Guests per Room">
          <InputIcon icon={User} type="number" placeholder="2" value={d.maxGuests||""} onChange={e=>set("maxGuests",e.target.value)}/>
        </Field>
        <Field label="Total Rooms Available">
          <InputIcon icon={Tag} type="number" placeholder="e.g. 24" value={d.totalRooms||""} onChange={e=>set("totalRooms",e.target.value)}/>
        </Field>
        <Field label="Check-In Time">
          <input type="time" className={inputCls} value={d.checkIn||""} onChange={e=>set("checkIn",e.target.value)}/>
        </Field>
        <Field label="Check-Out Time">
          <input type="time" className={inputCls} value={d.checkOut||""} onChange={e=>set("checkOut",e.target.value)}/>
        </Field>
      </div>
      <Field label="Physical Address" required>
        <InputIcon icon={MapPin} placeholder="Street, City, Country" value={d.address||""} onChange={e=>set("address",e.target.value)}/>
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Phone Number"><InputIcon icon={Phone} placeholder="+256 700 000 000" value={d.phone||""} onChange={e=>set("phone",e.target.value)}/></Field>
        <Field label="Booking Email"><InputIcon icon={Mail} type="email" placeholder="reservations@hotel.com" value={d.email||""} onChange={e=>set("email",e.target.value)}/></Field>
      </div>
      <Field label="Official Website" hint="Guests can visit for full room options.">
        <InputIcon icon={Globe} type="url" placeholder="https://www.yourhotel.com" value={d.website||""} onChange={e=>set("website",e.target.value)}/>
      </Field>
      <Field label="Service Description" required>
        <textarea rows={3} placeholder="Describe the property..." className={`${inputCls} resize-none`} value={d.description||""} onChange={e=>set("description",e.target.value)}/>
      </Field>
      <Field label="Amenities">
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {amenities.map(a => (
            <AmenityCheck key={a} label={a} checked={(d.amenities||[]).includes(a)}
              onChange={c => set("amenities", c ? [...(d.amenities||[]),a] : (d.amenities||[]).filter(x=>x!==a))}/>
          ))}
        </div>
      </Field>
      <Field label="Cancellation Policy">
        <Select value={d.cancellation||""} onChange={e=>set("cancellation",e.target.value)}>
          <option value="">Select policy</option>
          <option>Free cancellation up to 24 hours</option><option>Free cancellation up to 48 hours</option>
          <option>Free cancellation up to 7 days</option><option>Non-refundable</option><option>Partial refund (50%)</option>
        </Select>
      </Field>
    </div>
  );
};

const AirlineFields = ({ d, set }) => {
  const inclusions = ["Carry-on Baggage","Checked Baggage","Meals","In-flight Entertainment","WiFi","Lounge Access","Airport Transfer","Travel Insurance"];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Plane} label="FLIGHT SPECIFICATIONS" color="blue" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Service Type" required>
          <Select value={d.serviceType||""} onChange={e=>set("serviceType",e.target.value)}>
            <option value="">Select type</option>
            <option>Scheduled Flight</option><option>Charter Flight</option><option>Cargo Service</option>
            <option>Helicopter Transfer</option><option>Private Jet</option><option>Travel Agency / Ticketing</option>
          </Select>
        </Field>
        <Field label="Flight ID / Code"><input className={inputCls} placeholder="e.g. UG-202" value={d.flightCode||""} onChange={e=>set("flightCode",e.target.value)}/></Field>
        <Field label="Origin / Departure Hub" required><InputIcon icon={MapPin} placeholder="e.g. Entebbe International (EBB)" value={d.origin||""} onChange={e=>set("origin",e.target.value)}/></Field>
        <Field label="Destination(s)" required><InputIcon icon={MapPin} placeholder="e.g. Nairobi, Dubai" value={d.destinations||""} onChange={e=>set("destinations",e.target.value)}/></Field>
        <Field label="Base Price per Seat ($)" required><InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)}/></Field>
        <Field label="Cabin Class">
          <Select value={d.cabinClass||""} onChange={e=>set("cabinClass",e.target.value)}>
            <option value="">Select class</option>
            <option>Economy</option><option>Premium Economy</option><option>Business Class</option><option>First Class</option><option>All Classes</option>
          </Select>
        </Field>
        <Field label="Flight Duration"><InputIcon icon={Clock} placeholder="e.g. 1h 45min" value={d.flightDuration||""} onChange={e=>set("flightDuration",e.target.value)}/></Field>
        <Field label="Frequency / Schedule">
          <Select value={d.frequency||""} onChange={e=>set("frequency",e.target.value)}>
            <option value="">Select frequency</option>
            <option>Daily</option><option>Several times a week</option><option>Weekly</option><option>On Demand / Charter</option><option>Seasonal</option>
          </Select>
        </Field>
        <Field label="Available Seats"><InputIcon icon={User} type="number" placeholder="e.g. 180" value={d.capacity||""} onChange={e=>set("capacity",e.target.value)}/></Field>
        <Field label="IATA Code"><input className={inputCls} placeholder="e.g. EK, QR" value={d.iata||""} onChange={e=>set("iata",e.target.value)}/></Field>
        <Field label="Contact Phone"><InputIcon icon={Phone} placeholder="+256 700 000 000" value={d.phone||""} onChange={e=>set("phone",e.target.value)}/></Field>
        <Field label="Booking Email"><InputIcon icon={Mail} type="email" placeholder="bookings@airline.com" value={d.email||""} onChange={e=>set("email",e.target.value)}/></Field>
      </div>
      <Field label="Booking Website / Portal"><InputIcon icon={Globe} type="url" placeholder="https://www.yourairline.com/book" value={d.website||""} onChange={e=>set("website",e.target.value)}/></Field>
      <Field label="Service Description" required>
        <textarea rows={3} placeholder="Describe the service, routes, aircraft type..." className={`${inputCls} resize-none`} value={d.description||""} onChange={e=>set("description",e.target.value)}/>
      </Field>
      <Field label="Included in Ticket">
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {inclusions.map(a => (
            <AmenityCheck key={a} label={a} checked={(d.inclusions||[]).includes(a)}
              onChange={c => set("inclusions", c ? [...(d.inclusions||[]),a] : (d.inclusions||[]).filter(x=>x!==a))}/>
          ))}
        </div>
      </Field>
      <Field label="Cancellation / Refund Policy">
        <Select value={d.cancellation||""} onChange={e=>set("cancellation",e.target.value)}>
          <option value="">Select policy</option>
          <option>Free cancellation within 24 hours of booking</option><option>Free cancellation 48 hours before departure</option>
          <option>Non-refundable</option><option>Partial refund minus fees</option><option>Fully Flexible</option>
        </Select>
      </Field>
    </div>
  );
};

const TransportFields = ({ d, set }) => {
  const features = ["Air Conditioning","WiFi / Hotspot","GPS Tracking","Music System","Child Seat Available","Luggage Space","Wheelchair Accessible","Pet Friendly","Intercity Routes","24/7 Availability"];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Car} label="TRANSPORT CONFIGURATION" color="amber" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Vehicle / Transport Type" required>
          <Select value={d.vehicleType||""} onChange={e=>set("vehicleType",e.target.value)}>
            <option value="">Select type</option>
            <option>Motorcycle (Boda Boda)</option><option>Tuktuk / Bajaj</option><option>Saloon Car</option>
            <option>SUV / 4×4</option><option>Minibus / Taxi</option><option>Bus / Coach</option>
            <option>Truck / Pickup</option><option>Ambulance</option><option>Other</option>
          </Select>
        </Field>
        <Field label="Service Mode" required>
          <Select value={d.serviceMode||""} onChange={e=>set("serviceMode",e.target.value)}>
            <option value="">Select mode</option>
            <option>Ride Hailing (On Demand)</option><option>Airport Transfer</option><option>Daily Car Hire</option>
            <option>Long Distance / Intercity</option><option>Parcel Delivery</option><option>School / Event Shuttle</option>
          </Select>
        </Field>
        <Field label="Base Price ($)" required><InputIcon icon={DollarSign} type="number" placeholder="0.00" value={d.price||""} onChange={e=>set("price",e.target.value)}/></Field>
        <Field label="Pricing Unit">
          <Select value={d.priceUnit||"trip"} onChange={e=>set("priceUnit",e.target.value)}>
            <option value="trip">Per Trip</option><option value="km">Per KM</option><option value="hour">Per Hour</option><option value="day">Per Day</option>
          </Select>
        </Field>
        <Field label="Driver / Operator Name"><InputIcon icon={User} placeholder="Full name of driver/operator" value={d.driver||""} onChange={e=>set("driver",e.target.value)}/></Field>
        <Field label="Seating Capacity"><InputIcon icon={User} type="number" placeholder="e.g. 4" value={d.seats||""} onChange={e=>set("seats",e.target.value)}/></Field>
        <Field label="Vehicle Make & Model"><input className={inputCls} placeholder="e.g. Toyota Hiace 2020" value={d.vehicleModel||""} onChange={e=>set("vehicleModel",e.target.value)}/></Field>
        <Field label="Number Plate"><input className={inputCls} placeholder="e.g. UAA 123B" value={d.plate||""} onChange={e=>set("plate",e.target.value)}/></Field>
        <Field label="Contact Phone" required><InputIcon icon={Phone} placeholder="+256 700 000 000" value={d.phone||""} onChange={e=>set("phone",e.target.value)}/></Field>
        <Field label="Operating Area / Routes"><InputIcon icon={MapPin} placeholder="e.g. Kampala, Entebbe route" value={d.routes||""} onChange={e=>set("routes",e.target.value)}/></Field>
      </div>
      <Field label="Service Description" required>
        <textarea rows={3} placeholder="Describe your transport service..." className={`${inputCls} resize-none`} value={d.description||""} onChange={e=>set("description",e.target.value)}/>
      </Field>
      <Field label="Vehicle Features">
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {features.map(f => (
            <AmenityCheck key={f} label={f} checked={(d.features||[]).includes(f)}
              onChange={c => set("features", c ? [...(d.features||[]),f] : (d.features||[]).filter(x=>x!==f))}/>
          ))}
        </div>
      </Field>
      <Toggle checked={!!d.available24h} onChange={v=>set("available24h",v)} label="Available 24 / 7" desc="Available around the clock, including weekends." />
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"hotel",        label:"Hotels",   icon:<Hotel size={22}/>,    color:"teal"   },
  { id:"airline",      label:"Airlines", icon:<Plane size={22}/>,    color:"blue"   },
  { id:"professional", label:"Services", icon:<Briefcase size={22}/>,color:"purple" },
  { id:"transport",    label:"Transport",icon:<Bike size={22}/>,     color:"amber"  },
];
const CAT_ACTIVE      = { teal:"border-teal-600 bg-teal-50 text-teal-700",   blue:"border-blue-600 bg-blue-50 text-blue-700",   purple:"border-purple-600 bg-purple-50 text-purple-700", amber:"border-amber-500 bg-amber-50 text-amber-700" };
const CAT_ICON_ACTIVE = { teal:"text-teal-600", blue:"text-blue-600", purple:"text-purple-600", amber:"text-amber-500" };
const CAT_CHECK       = { teal:"text-teal-600", blue:"text-blue-600", purple:"text-purple-600", amber:"text-amber-500" };


// ─────────────────────────────────────────────────────────────
// SERVICE FORM — the modal content
//
// Props:
//   onClose(didCreate) — called when the form finishes.
//     didCreate = true  → listing was saved → parent should refresh
//     didCreate = false → user cancelled    → parent just closes modal
// ─────────────────────────────────────────────────────────────
const ServiceForm = ({ onClose }) => {
  const [serviceType,  setServiceType]  = useState('');
  const [title,        setTitle]        = useState('');
  const [data,         setData]         = useState({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [coverImage,   setCoverImage]   = useState(null);   // File object for upload
  const [coverPreview, setCoverPreview] = useState(null);   // blob URL for preview

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  // ── IMAGE SELECTION ──
  // Stores the File object (for the API upload) and creates a local
  // preview URL so the vendor can see what they selected.
  // Nothing is uploaded to the server here — only on form submit.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size to match API requirements
    // (max 5 MB, JPEG/PNG/WebP only per your Swagger docs)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Image must be JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  };

  // ─────────────────────────────────────────────────────────
  // SUBMIT HANDLER
  //
  // Step A: Validate required fields
  // Step B: buildListingPayload() translates form state → API shape
  // Step C: POST /api/v1/listings/ to create the listing
  // Step D: If an image was selected, POST to /listings/{id}/images/
  // Step E: Call onClose(true) so ServiceManagement refreshes its grid
  // ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceType) { setError('Please select a service category.'); return; }
    if (!title.trim()) { setError('Please enter a service title.');     return; }

    setIsLoading(true);
    setError('');

    try {
      // Step B — build the payload the API expects
      const payload = buildListingPayload(serviceType, title, data);

      // Step C — create the listing, get back the new listing object with its id
      const newListing = await createListing(payload);

      // Step D — upload cover image separately (API requires multipart/form-data)
      if (coverImage && newListing?.id) {
        await uploadListingImage(newListing.id, coverImage);
      }

      // Step E — signal success to the parent (ServiceManagement)
      // Passing true tells it a new listing was created → refresh the grid
      // toast.success('Service created successfully!');  ← uncomment with toast
      onClose?.(true);

    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.message
        || 'Failed to save service. Check your connection and try again.';
      setError(msg);
      console.error('ServiceForm error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 pr-8">
        <h3 className="text-xl font-black text-gray-900">Create New Service</h3>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to list a new service on the marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}><X size={15}/></button>
          </div>
        )}

        {/* Title */}
        <Field label="Service Title" required>
          <InputIcon icon={FileText} placeholder="e.g. Advanced Data Analytics Consultation"
            value={title} onChange={e => setTitle(e.target.value)}/>
        </Field>

        {/* Category picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Category <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => {
              const active = serviceType === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => setServiceType(cat.id)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    active ? CAT_ACTIVE[cat.color] : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                  }`}>
                  {active && <CheckCircle2 className={`absolute top-2 right-2 ${CAT_CHECK[cat.color]}`} size={15}/>}
                  <span className={active ? CAT_ICON_ACTIVE[cat.color] : "text-gray-400"}>{cat.icon}</span>
                  <span className="text-xs font-black mt-2 uppercase tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {serviceType && <div className="border-t border-gray-100"/>}

        {/* Type-specific fields */}
        {serviceType === "professional" && <ProfessionalFields d={data} set={set}/>}
        {serviceType === "hotel"        && <HotelFields        d={data} set={set}/>}
        {serviceType === "airline"      && <AirlineFields      d={data} set={set}/>}
        {serviceType === "transport"    && <TransportFields    d={data} set={set}/>}

        {/* Cover image upload — only shown after a type is picked */}
        {serviceType && (
          <Field label="Cover Image" hint="JPG, PNG, or WebP — max 5 MB. Recommended: 800×600px">
            <div
              onClick={() => document.getElementById('svc-img').click()}
              className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-teal-400 transition-colors bg-gray-50"
            >
              {coverPreview ? (
                // Show a preview of the selected image
                <div className="relative h-40">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center gap-1">
                  <Image size={24} className="text-gray-300 mb-1"/>
                  <p className="text-sm text-gray-400 font-semibold">Click to upload cover image</p>
                </div>
              )}
            </div>
            {/* Hidden input — triggered by clicking the box */}
            <input
              id="svc-img"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </Field>
        )}

        {/* Action buttons — these are INSIDE the return(), inside the form */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onClose?.(false)}
            disabled={isLoading}
            className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!serviceType || !title.trim() || isLoading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm shadow-amber-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Publishing…
              </span>
            ) : 'Publish Service'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ServiceForm;