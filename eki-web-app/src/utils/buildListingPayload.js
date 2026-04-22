/**
 * Fixed buildListingPayload to ensure business_category is always set correctly
 * Fixed validation errors for business_category field
 */

// ─── Backend enum maps ────────────────────────────────────────────────────────

const PROPERTY_TYPE_PASS = {
  hotel:'hotel', lodge:'lodge', guesthouse:'guesthouse', airbnb:'airbnb',
  resort:'resort', hostel:'hostel', serviced_apartment:'serviced_apartment', villa:'villa',
};

const AIRLINE_SERVICE_TYPE_PASS = {
  scheduled:'scheduled', charter:'charter', cargo:'cargo',
  helicopter:'helicopter', private_jet:'private_jet', ticketing:'ticketing',
};

const CABIN_CLASS_PASS = {
  economy:'economy', premium_economy:'premium_economy',
  business:'business', first:'first', all:'all',
};

const VEHICLE_TYPE_PASS = {
  motorcycle:'motorcycle', tuktuk:'tuktuk', saloon_car:'saloon_car', suv:'suv',
  minibus:'minibus', bus:'bus', truck:'truck', ambulance:'ambulance', other:'other',
};

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

  // ── 1. Determine business_category (FIXED - always set properly) ──────────────
  let businessCategory;
  
  // Map frontend service types to backend business categories
  if (serviceType === 'hotels' || serviceType === 'hotel') {
    businessCategory = 'hotels';
  } 
  else if (serviceType === 'airlines' || serviceType === 'airline') {
    businessCategory = 'airlines';
  } 
  else if (serviceType === 'transport') {
    businessCategory = 'transport';
  } 
  else if (serviceType === 'tailoring') {
    businessCategory = 'tailoring';
  }
  else if (serviceType === 'beauty') {
    businessCategory = 'beauty';
  }
  else if (serviceType === 'professional' || serviceType === 'other') {
    businessCategory = 'professional';
  }
  else {
    // Default to professional if unknown
    businessCategory = 'professional';
  }

  // ── 2. Top-level listing fields ──────────────────────────────────────────────
  const payload = {
    business_category: businessCategory,
    title: title || '',
    description: formData.description || '',
    status: formData.status || 'published',
    location: formData.address || '',
    price: formData.price ? String(formData.price) : '0',
    price_unit: formData.priceUnit || 'session',
    contact_phone: formData.phone || '',
    contact_email: formData.email || '',
    availability: formData.availability || 'available',
  };

  // Detail object per service type
  let detail = {};

  // HOTEL / HOSPITALITY
  if (serviceType === 'hotels' || serviceType === 'hotel') {
    detail = {
      hotel_name: title,
      property_type: PROPERTY_TYPE_PASS[formData.propertyType] || 'hotel',
      star_rating: formData.stars ? parseInt(formData.stars) : null,
      amenities: formData.inclusions || [],
      check_in_time: formData.checkIn || '14:00',
      check_out_time: formData.checkOut || '11:00',
      cancellation_policy: formData.cancellation || '',
      rooms: [{
        room_type: formData.roomCategory?.toLowerCase().replace(/\s+/g, '_') || 'standard',
        price_per_night: formData.price || '0',
        rooms_available: parseInt(formData.totalRooms) || 1,
        max_adults: parseInt(formData.maxGuests) || 2,
      }],
    };
  }

  // AIRLINE
  else if (serviceType === 'airlines' || serviceType === 'airline') {
    detail = {
      airline_name: title,
      service_type: AIRLINE_SERVICE_TYPE_PASS[formData.serviceType] || 'scheduled',
      iata_code: formData.iata || '',
      flight_number: formData.flightCode || '',
      origin: formData.origin || '',
      destination: formData.destinations || '',
      departure_datetime: isoOffset(1),
      arrival_datetime: isoOffset(3),
      flight_duration: formData.flightDuration || '',
      frequency: formData.frequency || '',
      inclusions: formData.inclusions || [],
      cancellation_policy: formData.cancellation || '',
      seat_classes: [{
        seat_class: CABIN_CLASS_PASS[formData.cabinClass] || 'economy',
        price: formData.price || '0',
        seats_available: parseInt(formData.capacity) || 1,
      }],
    };
  }

  // TRANSPORT
  else if (serviceType === 'transport') {
    detail = {
      vehicle_type: VEHICLE_TYPE_PASS[formData.vehicleType] || 'other',
      vehicle_model: formData.vehicleModel || '',
      vehicle_number_plate: formData.plate || '',
      service_mode: SERVICE_MODE_PASS[formData.serviceMode] || 'ride_hailing',
      driver_name: formData.driver || '',
      origin: formData.origin || '',
      destination: formData.destination || '',
      departure_datetime: isoOffset(1),
      price_per_seat: formData.price || '0',
      seats_available: parseInt(formData.seats) || 1,
      available_24h: !!formData.available24h,
      features: formData.inclusions || [],
    };
  }

  // TAILORING
else if (serviceType === 'tailoring') {
  detail = {
    service_type: formData.tailoringServiceType || 'custom',
    price: parseFloat(formData.price) || 0,
    fabric_material: formData.fabricMaterial || '',
    delivery_mode: 'in_person', // Always in_person since customer comes to vendor
    duration_days: parseInt(formData.turnaroundTime) || 3,
    languages: formData.languages || '',
    inclusions: formData.inclusions || [],
    measurements_required: formData.measurementsRequired || 'optional',
  };
}

  // BEAUTY & HEALTH
  else if (serviceType === 'beauty') {
    detail = {
      service_category: formData.beautyCategory || '',
      price: parseFloat(formData.price) || 0,
      price_unit: formData.priceUnit || 'session',
      duration_minutes: parseInt(formData.duration) || 60,
      products_used: formData.productsUsed || '',
      mobile_service: !!formData.mobileService,
      group_sessions: !!formData.groupSessions,
      languages: formData.languages || '',
      inclusions: formData.inclusions || [],
    };
  }

  // PROFESSIONAL / OTHER SERVICES
  else if (serviceType === 'professional' || serviceType === 'other') {
    detail = {
      sub_category: formData.otherCategory || 'other',
      price: parseFloat(formData.price) || 0,
      price_unit: formData.priceUnit || 'session',
      duration: formData.duration || '',
      availability: formData.availability || 'available',
      languages: formData.languages || '',
      is_remote: !!formData.remote,
      platform_url: formData.platform || '',
      delivery_mode: formData.remote ? 'remote' : 'in_person',
      inclusions: formData.inclusions || [],
    };
  }

  return { ...payload, detail };
};