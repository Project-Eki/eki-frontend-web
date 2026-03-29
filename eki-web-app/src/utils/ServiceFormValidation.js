/**
 * Count words in a string
 * @param {string} str - The input string
 * @returns {number} - Number of words
 */
export const countWords = (str = "") => str.trim().split(/\s+/).filter(Boolean).length;

/**
 * Validate a specific step of the service form
 * @param {number} step - Current step number (1-4)
 * @param {string} serviceType - Type of service (hotel, airline, professional, transport)
 * @param {string} title - Service title
 * @param {object} d - Form data object
 * @returns {object} - Validation errors object
 */
export const validateStep = (step, serviceType, title, d) => {
  const errors = {};
  
  if (step === 1) {
    if (!title.trim()) {
      errors.title = "Service title is required.";
    }
    if (!serviceType) {
      errors.category = "Please select a category.";
    }
  }
  
  if (step === 2) {
    // Common validation
    if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0) {
      errors.price = "A valid price is required.";
    }
    
    // Hotel specific validation
    if (serviceType === "hotel") {
      if (!d.propertyType) {
        errors.propertyType = "Property type is required.";
      }
      if (!d.roomCategory) {
        errors.roomCategory = "Room category is required.";
      }
      if (!d.address) {
        errors.address = "Address is required.";
      }
    }
    
    // Airline specific validation
    if (serviceType === "airline") {
      if (!d.serviceType) {
        errors.serviceType = "Service type is required.";
      }
      if (!d.origin) {
        errors.origin = "Origin is required.";
      }
      if (!d.destinations) {
        errors.destinations = "Destination is required.";
      }
    }
    
    // Transport specific validation
    if (serviceType === "transport") {
      if (!d.vehicleType) {
        errors.vehicleType = "Vehicle type is required.";
      }
      if (!d.serviceMode) {
        errors.serviceMode = "Service mode is required.";
      }
      if (!d.phone) {
        errors.phone = "Contact phone is required.";
      }
    }
    
    // Professional service specific validation
    if (serviceType === "professional") {
      if (!d.category) {
        errors.category = "Category is required.";
      }
      if (d.category === "tailoring" && !d.fabricMaterial) {
        errors.fabricMaterial = "Fabric material is required for tailoring.";
      }
    }
  }
  
  if (step === 3) {
    const wc = countWords(d.description || "");
    if (wc === 0) {
      errors.description = "Description is required.";
    } else if (wc > 20) {
      errors.description = `Too long — ${wc} words (max 20 allowed).`;
    }
    // 1-19 words are now valid.
  }
  
  return errors;
};

/**
 * Validate all steps of the form
 * @param {string} serviceType - Type of service
 * @param {string} title - Service title
 * @param {object} data - Form data object
 * @returns {object} - Object containing step number and errors
 */
export const validateAllSteps = (serviceType, title, data) => {
  for (let step = 1; step <= 3; step++) {
    const errors = validateStep(step, serviceType, title, data);
    if (Object.keys(errors).length > 0) {
      return { step, errors };
    }
  }
  return { step: null, errors: {} };
};