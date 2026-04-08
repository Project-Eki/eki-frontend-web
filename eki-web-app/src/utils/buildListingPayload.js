/**
 *
 * 1. "tailoring" is not a valid TailoringDetail.service_type choice
 *    The TailoringDetail serializer expects service_type ∈ {alterations, custom,
 *    embroidery, repairs}. The frontend was sending "tailoring" as the service_type
 *    which caused:  errors: {detail: {service_type: ['"tailoring" is not a valid choice.']}}
 *    Fix: when business_category === "tailoring", always send service_type: "custom"
 *    (the most generic choice). For other tailoring sub-types the vendor can be
 *    prompted in a future iteration.
 *
 * 2. price vs base_price
 *    TailoringDetail.price (required) — was being sent as base_price, fixed.
 *
 * 3. "professional" is now a real backend category (doc 29 BusinessCategory)
 *    business_category: "professional" → routes to ProfessionalDetail.
 *    All non-tailoring "Services" card selections now use this category.
 *
 * 4. Transport departure_datetime is required by the serializer.
 *    We now pass the current datetime + 1 hour as a safe default so the form
 *    doesn't require the vendor to enter a date/time for on-demand services.
 *
 * 5. Airline departure_datetime / arrival_datetime — same treatment.
 *
 * 6. All enum value mappings preserved from previous version (vehicle_type,
 *    service_mode, cabin_class, hotel property_type, airline service_type).
 */

// ─── Backend enum maps ────────────────────────────────────────────────────────

// Hotel property type: frontend value → backend enum (HotelPropertyType)
// These are already backend values since the ServiceForm was fixed last time.
// Kept for clarity / double-check.
const PROPERTY_TYPE_PASS = {
  hotel:'hotel', lodge:'lodge', guesthouse:'guesthouse', airbnb:'airbnb',
  resort:'resort', hostel:'hostel', serviced_apartment:'serviced_apartment', villa:'villa',
};

// Airline service type (AirlineServiceType)
const AIRLINE_SERVICE_TYPE_PASS = {
  scheduled:'scheduled', charter:'charter', cargo:'cargo',
  helicopter:'helicopter', private_jet:'private_jet', ticketing:'ticketing',
};

// Cabin class (SeatClass)
const CABIN_CLASS_PASS = {
  economy:'economy', premium_economy:'premium_economy',
  business:'business', first:'first', all:'all',
};

// Vehicle type (VehicleType) — already fixed in ServiceForm dropdowns
const VEHICLE_TYPE_PASS = {
  motorcycle:'motorcycle', tuktuk:'tuktuk', saloon_car:'saloon_car', suv:'suv',
  minibus:'minibus', bus:'bus', truck:'truck', ambulance:'ambulance', other:'other',
};

// Transport service mode (TransportServiceMode)
const SERVICE_MODE_PASS = {
  ride_hailing:'ride_hailing', airport_transfer:'airport_transfer', daily_hire:'daily_hire',
  long_distance:'long_distance', parcel_delivery:'parcel_delivery', shuttle:'shuttle',
};

// Helper: ISO datetime string now + offsetHours
const isoOffset = (offsetHours = 0) => {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  return d.toISOString();
};

// ─── Main function ────────────────────────────────────────────────────────────

export const buildListingPayload = (serviceType, title, formData) => {

  // ── 1. Determine business_category ──────────────────────────────────────────
  // hotel → "hotels", airline → "airlines", transport → "transport"
  // professional with tailoring sub-cat → "tailoring"
  // professional with any other sub-cat → "professional"
  let businessCategory;
  if (serviceType === 'hotel')     businessCategory = 'hotels';
  else if (serviceType === 'airline')    businessCategory = 'airlines';
  else if (serviceType === 'transport')  businessCategory = 'transport';
  else if (serviceType === 'professional') {
    businessCategory = formData.category === 'tailoring' ? 'tailoring' : 'professional';
  }

  // ── 2. Top-level listing fields ──────────────────────────────────────────────
  const payload = {
    business_category: businessCategory,
    title,
    description: formData.description || '',
    status:      'published',
    location:    formData.address || '',
    price:       formData.price   || '0',
    price_unit:  formData.priceUnit || 'session',
    contact_phone: formData.phone || '',
    contact_email: formData.email || '',
    availability:  formData.availability || 'available',
  };

  //Detail object per service type 
  let detail = {};

  // HOTEL 
  if (serviceType === 'hotel') {
    detail = {
      hotel_name:     title,
      property_type:  PROPERTY_TYPE_PASS[formData.propertyType] || 'hotel',
      star_rating:    parseInt(formData.stars) || null,
      amenities:      formData.amenities || [],
      check_in_time:  formData.checkIn   || '14:00',
      check_out_time: formData.checkOut  || '11:00',
      cancellation_policy: formData.cancellation || '',
      rooms: [{
        room_type:       'double',               // backend RoomType enum
        price_per_night: formData.price || '0',
        rooms_available: parseInt(formData.totalRooms) || 1,
        max_adults:      parseInt(formData.maxGuests)  || 2,
      }],
    };
  }

  // AIRLINE 
  // departure_datetime and arrival_datetime are required by the serializer.
  // We default to +1h and +3h from now so the form submission succeeds.
  // Vendors who need precise times can edit the listing afterwards.
  else if (serviceType === 'airline') {
    detail = {
      airline_name:    title,
      service_type:    AIRLINE_SERVICE_TYPE_PASS[formData.serviceType] || 'scheduled',
      iata_code:       formData.iata        || '',
      flight_number:   formData.flightCode  || '',
      origin:          formData.origin      || '',
      destination:     formData.destinations || '',
      departure_datetime: isoOffset(1),
      arrival_datetime:   isoOffset(3),
      flight_duration: formData.flightDuration || '',
      frequency:       formData.frequency   || '',
      inclusions:      formData.inclusions  || [],
      cancellation_policy: formData.cancellation || '',
      seat_classes: [{
        seat_class:      CABIN_CLASS_PASS[formData.cabinClass] || 'economy',
        price:           formData.price || '0',
        seats_available: parseInt(formData.capacity) || 1,
      }],
    };
  }

  //TRANSPORT 
  // departure_datetime is required; we default to +1h from now.
  else if (serviceType === 'transport') {
    detail = {
      vehicle_type:         VEHICLE_TYPE_PASS[formData.vehicleType] || 'other',
      vehicle_model:        formData.vehicleModel || '',
      vehicle_number_plate: formData.plate        || '',
      service_mode:         SERVICE_MODE_PASS[formData.serviceMode] || 'ride_hailing',
      driver_name:          formData.driver       || '',
      origin:               formData.origin       || formData.routes || '',
      destination:          formData.destination || formData.routes || '',
      departure_datetime:   isoOffset(1),
      price_per_seat:       formData.price || '0',
      seats_available:      parseInt(formData.seats) || 1,
      available_24h:        !!formData.available24h,
      features:             formData.inclusions || [],
    };
  }

  // TAILORING (professional + tailoring sub-category) 
  // TailoringDetail.service_type ∈ {alterations, custom, embroidery, repairs}
  // We always send "custom" as a safe default for the create flow.
  else if (serviceType === 'professional' && formData.category === 'tailoring') {
    detail = {
      service_type:   'custom',                          // TailoringServiceType enum
      price:          parseFloat(formData.price) || 0,   // required Decimal field
      fabric_material: formData.fabricMaterial || '',
      delivery_mode:  formData.remote ? 'remote' : 'in_person',
      duration_days:  parseInt(formData.duration) || 1,
      languages:      formData.languages || '',
      inclusions:     formData.inclusions || [],
    };
  }

  //  PROFESSIONAL (all other services — events, coaching, beauty, etc.) 
  // Routes to ProfessionalDetail (business_category: "professional").
  else if (serviceType === 'professional') {
    detail = {
      sub_category:  formData.category || 'other',       // soft label, not a strict enum
      price:         parseFloat(formData.price) || 0,
      price_unit:    formData.priceUnit || 'session',
      duration:      formData.duration  || '',
      availability:  formData.availability || 'available',
      languages:     formData.languages  || '',
      is_remote:     !!formData.remote,
      platform_url:  formData.platform || '',
      delivery_mode: formData.remote ? 'remote' : 'in_person',
      inclusions:    formData.inclusions || [],
    };
  }

  return { ...payload, detail };
};