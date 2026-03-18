/**
 * Validates the Account Settings form data.
 * @param {Object} data - The current state of userData
 * @returns {Object} - An object containing error messages
 */
export const validateAccountData = (data) => {
  let errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10,15}$/;

  if (!data.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!data.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = "Please enter a valid phone number (digits only)";
  }

  return errors;
};