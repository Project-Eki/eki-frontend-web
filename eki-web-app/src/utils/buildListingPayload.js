const CATEGORY_MAP = {
  hotel: "hotels",
  airline: "airlines",
  transport: "transport",
  professional: "tailoring", // Mapping 'professional' to 'tailoring' per your Swagger types
};

export const buildListingPayload = (serviceType, title, formData) => {
  const businessCategory = CATEGORY_MAP[serviceType];
  
  // 1. Top-level fields (common to all)
  const payload = {
    business_category: businessCategory,
    listing_type: "service",
    title: title,
    description: formData.description || "",
    status: "published", 
    location: formData.address || "",
    price: formData.price || "0",
    price_unit: formData.priceUnit || "session",
    contact_phone: formData.phone || "",
    contact_email: formData.email || "",
  };

  // 2. Build the 'detail' object based on Swagger requirements
  let detail = {};

  if (serviceType === "hotel") {
    detail = {
      hotel_name: title,
      property_type: formData.propertyType || "hotel",
      star_rating: parseInt(formData.stars) || 1,
      amenities: formData.amenities || [],
      check_in_time: formData.checkIn || "14:00",
      check_out_time: formData.checkOut || "11:00",
      rooms: [{
        room_type: formData.roomCategory || "Standard",
        price_per_night: formData.price || "0",
        rooms_available: parseInt(formData.totalRooms) || 1,
        max_adults: parseInt(formData.maxGuests) || 2
      }]
    };
  } 
  
  else if (serviceType === "airline") {
    detail = {
      airline_name: title,
      service_type: "scheduled",
      iata_code: formData.iata || "",
      flight_number: formData.flightCode || "",
      origin: formData.origin || "",
      destination: formData.destinations || "",
      flight_duration: formData.flightDuration || "",
      seat_classes: [{
        seat_class: formData.cabinClass || "economy",
        price: formData.price || "0",
        seats_available: parseInt(formData.capacity) || 1
      }]
    };
  }

  else if (serviceType === "transport") {
    detail = {
      vehicle_type: formData.vehicleType || "van",
      vehicle_model: formData.vehicleModel || "",
      vehicle_number_plate: formData.plate || "",
      driver_name: formData.driver || "",
      origin: formData.origin || "",
      destination: formData.destinations || "",
      price_per_seat: formData.price || "0",
      seats_available: parseInt(formData.seats) || 1
    };
  }

  else if (serviceType === "professional") {
    detail = {
      service_type: formData.category || "custom",
      price: formData.price || "0",
      fabric_material: "N/A", // Required by tailoring schema
      duration_days: parseInt(formData.duration) || 1,
      delivery_mode: formData.remote ? "remote" : "in_person"
    };
  }

  return { ...payload, detail };
};