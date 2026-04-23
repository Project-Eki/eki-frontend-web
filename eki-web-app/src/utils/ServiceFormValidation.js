/**
 * Service Form Validation Utilities
 * Validates all steps of the multi-step service creation form
 */

/**
 * Count words in a string
 * @param {string} str - The input string
 * @returns {number} - Number of words
 */
export const countWords = (str = "") => {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Accepts: +256XXXXXXXXX, 07XXXXXXXX, 256XXXXXXXXX
  const phoneRegex = /^(\+?256|0)[7-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate price
 * @param {any} price - Price value to validate
 * @returns {boolean} - Is valid price
 */
export const isValidPrice = (price) => {
  if (!price && price !== 0) return false;
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Validate step 1: Basics (Title and Category)
 * @param {string} title - Service title
 * @param {string} serviceType - Selected service category
 * @returns {object} - Validation errors
 */
const validateBasicsStep = (title, serviceType) => {
  const errors = {};
  
  if (!title || !title.trim()) {
    errors.title = "Service title is required.";
  } else if (title.trim().length < 3) {
    errors.title = "Service title must be at least 3 characters.";
  } else if (title.trim().length > 100) {
    errors.title = "Service title must be less than 100 characters.";
  }
  
  // Category validation - serviceType comes from vendor onboarding
  // so we don't strictly require it here, but warn if missing
  if (!serviceType) {
    errors.category = "Please select a service category.";
  }
  
  return errors;
};

/**
 * Validate step 2: Details (Service-specific fields)
 * @param {string} serviceType - Type of service
 * @param {object} d - Form data object
 * @returns {object} - Validation errors
 */
const validateDetailsStep = (serviceType, d) => {
  const errors = {};
  
  // Common validation for all service types
  if (!isValidPrice(d.price)) {
    errors.price = "Please enter a valid price greater than 0.";
  }
  
  if (d.phone && !isValidPhone(d.phone)) {
    errors.phone = "Please enter a valid phone number (e.g., +256 7XX XXX XXX).";
  }
  
  if (d.email && !isValidEmail(d.email)) {
    errors.email = "Please enter a valid email address.";
  }
  
  // Service-specific validation
  switch (serviceType) {
    case "hotels":
    case "hotel":
      if (!d.propertyType) {
        errors.propertyType = "Property type is required.";
      }
      if (!d.roomCategory) {
        errors.roomCategory = "Room category is required.";
      }
      if (!d.address || !d.address.trim()) {
        errors.address = "Property address is required.";
      }
      if (d.totalRooms && (parseInt(d.totalRooms) <= 0 || isNaN(parseInt(d.totalRooms)))) {
        errors.totalRooms = "Total rooms must be a positive number.";
      }
      if (d.maxGuests && (parseInt(d.maxGuests) <= 0 || isNaN(parseInt(d.maxGuests)))) {
        errors.maxGuests = "Max guests must be a positive number.";
      }
      break;
      
    case "airlines":
    case "airline":
      if (!d.serviceType) {
        errors.serviceType = "Flight service type is required.";
      }
      if (!d.origin || !d.origin.trim()) {
        errors.origin = "Origin airport/city is required.";
      }
      if (!d.destinations || !d.destinations.trim()) {
        errors.destinations = "Destination airport/city is required.";
      }
      break;
      
    case "transport":
      if (!d.vehicleType) {
        errors.vehicleType = "Vehicle type is required.";
      }
      if (!d.serviceMode) {
        errors.serviceMode = "Service mode is required.";
      }
      if (!d.origin || !d.origin.trim()) {
        errors.origin = "Pickup location is required.";
      }
      if (!d.destination || !d.destination.trim()) {
        errors.destination = "Dropoff location is required.";
      }
      if (!d.plate || !d.plate.trim()) {
        errors.plate = "Vehicle number plate is required.";
      }
      if (d.seats && (parseInt(d.seats) <= 0 || isNaN(parseInt(d.seats)))) {
        errors.seats = "Seating capacity must be a positive number.";
      }
      break;
      
    case "tailoring":
      if (!d.tailoringServiceType) {
        errors.tailoringServiceType = "Service type is required.";
      }
      if (!d.fabricMaterial || !d.fabricMaterial.trim()) {
        errors.fabricMaterial = "Fabric material is required.";
      }
      if (d.turnaroundTime && parseInt(d.turnaroundTime) <= 0) {
        errors.turnaroundTime = "Turnaround time must be a positive number.";
      }
      break;
      
    case "beauty":
      if (!d.beautyCategory) {
        errors.beautyCategory = "Beauty service category is required.";
      }
      if (d.duration && (parseInt(d.duration) <= 0 || isNaN(parseInt(d.duration)))) {
        errors.duration = "Duration must be a positive number.";
      }
      break;
      
    case "professional":
    case "other":
      if (!d.otherCategory) {
        errors.otherCategory = "Service sub-category is required.";
      }
      if (d.duration && parseInt(d.duration) <= 0 && !isNaN(parseInt(d.duration))) {
        errors.duration = "Duration must be a positive number if specified.";
      }
      break;
      
    default:
      // Unknown service type - minimal validation
      console.warn(`Unknown service type for validation: ${serviceType}`);
      break;
  }
  
  return errors;
};

/**
 * Validate step 3: Description
 * @param {object} d - Form data object
 * @returns {object} - Validation errors
 */
const validateDescriptionStep = (d) => {
  const errors = {};
  const description = d.description || "";
  const wordCount = countWords(description);
  
  if (wordCount === 0) {
    errors.description = "Service description is required.";
  } else if (wordCount < 5) {
    errors.description = `Description is too short (${wordCount} words). Minimum 5 words recommended.`;
  } else if (wordCount > 20) {
    errors.description = `Description is too long (${wordCount} words). Maximum 20 words allowed.`;
  }
  
  return errors;
};

/**
 * Validate a specific step of the service form
 * @param {number} step - Current step number (1-4)
 * @param {string} serviceType - Type of service (hotels, airlines, transport, tailoring, beauty, professional)
 * @param {string} title - Service title
 * @param {object} d - Form data object
 * @returns {object} - Validation errors object
 */
export const validateStep = (step, serviceType, title, d) => {
  switch (step) {
    case 1:
      return validateBasicsStep(title, serviceType);
    case 2:
      return validateDetailsStep(serviceType, d);
    case 3:
      return validateDescriptionStep(d);
    case 4:
      // Step 4 is images and publish - no validation needed
      return {};
    default:
      return {};
  }
};

/**
 * Validate all steps of the form
 * @param {string} serviceType - Type of service
 * @param {string} title - Service title
 * @param {object} data - Form data object
 * @returns {object} - Object containing step number and errors
 */
export const validateAllSteps = (serviceType, title, data) => {
  // Check step 1
  const step1Errors = validateBasicsStep(title, serviceType);
  if (Object.keys(step1Errors).length > 0) {
    return { step: 1, errors: step1Errors };
  }
  
  // Check step 2
  const step2Errors = validateDetailsStep(serviceType, data);
  if (Object.keys(step2Errors).length > 0) {
    return { step: 2, errors: step2Errors };
  }
  
  // Check step 3
  const step3Errors = validateDescriptionStep(data);
  if (Object.keys(step3Errors).length > 0) {
    return { step: 3, errors: step3Errors };
  }
  
  // All steps valid
  return { step: null, errors: {} };
};

/**
 * Check if a step is complete (for UI indicators)
 * @param {number} step - Step number
 * @param {string} serviceType - Service type
 * @param {string} title - Service title
 * @param {object} data - Form data
 * @returns {boolean} - Step is complete
 */
export const isStepComplete = (step, serviceType, title, data) => {
  const errors = validateStep(step, serviceType, title, data);
  return Object.keys(errors).length === 0;
};

/**
 * Get field error message for a specific field
 * @param {object} errors - Errors object
 * @param {string} fieldName - Field name
 * @returns {string|null} - Error message or null
 */
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};