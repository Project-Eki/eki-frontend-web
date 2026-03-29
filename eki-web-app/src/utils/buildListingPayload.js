/**
 * buildListingPayload.js
 *
 * FIXES:
 *
 * 1. PROFESSIONAL CATEGORY MAPPING
 *    OLD: professional → "tailoring" (hardcoded, wrong for all other service types)
 *    NEW: professional → uses the sub-category the vendor picked (d.category).
 *         The CATEGORY_MAP for "professional" is now dynamic:
 *         - If vendor picked "tailoring" sub-category → business_category = "tailoring"
 *         - If vendor picked "other" → business_category = "other"
 *         - etc.
 *    This fixes the error you saw where a "pream events" (decorating/events)
 *    service was being submitted as business_category: "tailoring".
 *
 * 2. TRANSPORT VEHICLE TYPES — backend enum values (snake_case, lowercase)
 *    The backend rejected "Tuktuk / Bajaj" because it expects the exact enum
 *    string. All vehicle_type values now map to backend-accepted strings.
 *
 * 3. TRANSPORT SERVICE MODE — backend enum values
 *    "Ride Hailing (On Demand)" → "ride_hailing", etc.
 *
 * 4. AIRLINE CABIN CLASS — backend expects lowercase, no spaces
 *    "Business Class" → "business", "First Class" → "first", etc.
 *
 * 5. HOTEL PROPERTY TYPE — backend expects lowercase
 *    "Airbnb / Short-Stay" → "airbnb", "Serviced Apartment" → "serviced_apartment"
 *
 * 6. AIRLINE SERVICE TYPE — removed hardcoded "scheduled", now reads from form.
 *
 * 7. PROFESSIONAL SERVICE TYPE — now reads from formData.category (the sub-category
 *    the vendor picked) instead of defaulting to "custom".
 */

// Maps the frontend serviceType (hotel/airline/transport/professional) to the
// backend's business_category field.
// For "professional", the sub-category the vendor picks IS the business_category.
const PROFESSIONAL_SUBCATEGORY_MAP = {
  retail:      'retail',
  fashion:     'fashion',
  electronics: 'electronics',
  food:        'food',
  beauty:      'beauty',
  home:        'home',
  sports:      'sports',
  automotive:  'automotive',
  tailoring:   'tailoring',
  other:       'other',
};

// Maps vehicle type display labels → backend enum values
const VEHICLE_TYPE_MAP = {
  'Motorcycle (Boda Boda)': 'motorcycle',
  'Tuktuk / Bajaj':         'tuktuk',
  'Saloon Car':             'saloon_car',
  'SUV / 4×4':              'suv',
  'Minibus / Taxi':         'minibus',
  'Bus / Coach':            'bus',
  'Truck / Pickup':         'truck',
  'Ambulance':              'ambulance',
  'Other':                  'other',
};

// Maps service mode display labels → backend enum values
const SERVICE_MODE_MAP = {
  'Ride Hailing (On Demand)':  'ride_hailing',
  'Airport Transfer':           'airport_transfer',
  'Daily Car Hire':             'daily_hire',
  'Long Distance / Intercity':  'long_distance',
  'Parcel Delivery':            'parcel_delivery',
  'School / Event Shuttle':     'shuttle',
};

// Maps cabin class display labels → backend enum values
const CABIN_CLASS_MAP = {
  'Economy':         'economy',
  'Premium Economy': 'premium_economy',
  'Business Class':  'business',
  'First Class':     'first',
  'All Classes':     'all',
};

// Maps property type display labels → backend enum values
const PROPERTY_TYPE_MAP = {
  'Hotel':                'hotel',
  'Lodge':                'lodge',
  'Guesthouse':           'guesthouse',
  'Airbnb / Short-Stay':  'airbnb',
  'Resort':               'resort',
  'Hostel':               'hostel',
  'Serviced Apartment':   'serviced_apartment',
  'Villa':                'villa',
};

// Maps airline service type display labels → backend enum values
const AIRLINE_SERVICE_TYPE_MAP = {
  'Scheduled Flight':           'scheduled',
  'Charter Flight':             'charter',
  'Cargo Service':              'cargo',
  'Helicopter Transfer':        'helicopter',
  'Private Jet':                'private_jet',
  'Travel Agency / Ticketing':  'ticketing',
};

export const buildListingPayload = (serviceType, title, formData) => {

  // ── Determine business_category ──
  // For hotel/airline/transport → use fixed category name.
  // For professional → use the sub-category the vendor chose (e.g. "tailoring", "retail").
  let businessCategory;
  if (serviceType === 'hotel')        businessCategory = 'hotels';
  else if (serviceType === 'airline') businessCategory = 'airlines';
  else if (serviceType === 'transport') businessCategory = 'transport';
  else if (serviceType === 'professional') {
    // Use the vendor's chosen sub-category, fall back to 'other'
    businessCategory = PROFESSIONAL_SUBCATEGORY_MAP[formData.category] || 'other';
  }

  // ── Top-level fields (common to all service types) ──
  const payload = {
    business_category: businessCategory,
    listing_type:      'service',
    title:             title,
    description:       formData.description || '',
    status:            'published',
    location:          formData.address || '',
    price:             formData.price || '0',
    price_unit:        formData.priceUnit || 'session',
    contact_phone:     formData.phone || '',
    contact_email:     formData.email || '',
  };

  // ── Build the detail object per service type ──
  let detail = {};

  // ── HOTEL ──
  if (serviceType === 'hotel') {
    detail = {
      hotel_name:     title,
      property_type:  PROPERTY_TYPE_MAP[formData.propertyType] || 'hotel',
      star_rating:    parseInt(formData.stars) || 1,
      amenities:      formData.amenities || [],
      check_in_time:  formData.checkIn || '14:00',
      check_out_time: formData.checkOut || '11:00',
      rooms: [{
        room_type:       formData.roomCategory || 'Standard',
        price_per_night: formData.price || '0',
        rooms_available: parseInt(formData.totalRooms) || 1,
        max_adults:      parseInt(formData.maxGuests) || 2,
      }],
    };
  }

  // ── AIRLINE ──
  else if (serviceType === 'airline') {
    detail = {
      airline_name:    title,
      service_type:    AIRLINE_SERVICE_TYPE_MAP[formData.serviceType] || 'scheduled',
      iata_code:       formData.iata || '',
      flight_number:   formData.flightCode || '',
      origin:          formData.origin || '',
      destination:     formData.destinations || '',
      flight_duration: formData.flightDuration || '',
      seat_classes: [{
        seat_class:      CABIN_CLASS_MAP[formData.cabinClass] || 'economy',
        price:           formData.price || '0',
        seats_available: parseInt(formData.capacity) || 1,
      }],
    };
  }

  // ── TRANSPORT ──
  else if (serviceType === 'transport') {
    detail = {
      vehicle_type:         VEHICLE_TYPE_MAP[formData.vehicleType] || 'other',
      vehicle_model:        formData.vehicleModel || '',
      vehicle_number_plate: formData.plate || '',
      driver_name:          formData.driver || '',
      origin:               formData.origin || '',
      destination:          formData.destinations || formData.routes || '',
      price_per_seat:       formData.price || '0',
      seats_available:      parseInt(formData.seats) || 1,
      service_mode:         SERVICE_MODE_MAP[formData.serviceMode] || 'ride_hailing',
      available_24h:        !!formData.available24h,
    };
  }

  // ── PROFESSIONAL (all other services — events, coaching, beauty, etc.) ──
  else if (serviceType === 'professional') {
    detail = {
      // service_type: vendor's chosen sub-category (not hardcoded "custom")
      service_type:   formData.category || 'other',
      base_price: parseFloat(formData.price) || 0,
      // fabric_material only makes sense for tailoring; send empty for others
      fabric_material: formData.category === 'tailoring' ? (formData.fabricMaterial || '') : '',
      duration_days:   parseInt(formData.duration) || 1,
      delivery_mode:   formData.remote ? 'remote' : 'in_person',
      languages:       formData.languages || '',
      availability:    formData.availability || 'available',
      inclusions:      formData.inclusions || [],
      ...(formData.remote && formData.platform ? { platform_link: formData.platform } : {}),
    };
  }

  return { ...payload, detail };
};