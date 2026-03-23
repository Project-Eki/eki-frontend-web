// Step 1: Account Basics
export const validateAccountBasics = (formData) => {
  const errors = {};
  const { first_name, last_name, email, password, confirmPassword, agreeToTerms } = formData;

  if (!first_name?.trim()) errors.first_name = "Required";
  if (!last_name?.trim()) errors.last_name = "Required";

  if (!email?.trim()) {
    errors.email = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid format";
  }

  if (!password) {
    errors.password = "Required";
  } else {
    if (password.length < 8) errors.password = "Min 8 characters";
    if (password.toLowerCase() === password || password.toUpperCase() === password)
      errors.password = "Must use Up & Lowercase";
    if (password === email) errors.password = "Cannot match email";
    if (/^\d+$/.test(password)) errors.password = "Cannot be only numbers";
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!agreeToTerms) errors.terms = "Accept terms to continue";

  return errors;
};


// Step 3: Business Identity
// Tax ID and Registration Number use worldwide-friendly validation
// since formats vary significantly by country (Uganda TIN is 10 digits,
// Kenya KRA PIN is alphanumeric, US EIN uses hyphens, etc.)
export const validateBusinessIdentity = (formData) => {
  const errors = {};

  // Business Name
  if (!formData.business_name?.trim()) {
    errors.business_name = "Required";
  } else if (formData.business_name.trim().length < 3) {
    errors.business_name = "Too short";
  }

  // Tax ID — worldwide flexible: 5–20 chars, letters/numbers/hyphens only
  if (!formData.tax_id?.trim()) {
    errors.tax_id = "Required";
  } else if (formData.tax_id.trim().length < 5) {
    errors.tax_id = "Too short";
  } else if (formData.tax_id.trim().length > 20) {
    errors.tax_id = "Too long";
  } else if (!/^[a-zA-Z0-9\-\/]+$/.test(formData.tax_id.trim())) {
    errors.tax_id = "Letters, numbers & hyphens only";
  }

  // Registration Number — worldwide flexible: 4–30 chars, letters/numbers/hyphens/slashes
  if (!formData.registration_number?.trim()) {
    errors.registration_number = "Required";
  } else if (formData.registration_number.trim().length < 4) {
    errors.registration_number = "Too short";
  } else if (formData.registration_number.trim().length > 30) {
    errors.registration_number = "Too long";
  } else if (!/^[a-zA-Z0-9\-\/]+$/.test(formData.registration_number.trim())) {
    errors.registration_number = "Letters, numbers & hyphens only";
  }

  // Owner Full Name
  if (!formData.owner_full_name?.trim()) {
    errors.owner_full_name = "Required";
  } else if (!formData.owner_full_name.trim().includes(" ")) {
    errors.owner_full_name = "Enter first & last name";
  }

  return errors;
};


// Step 4: Contact & Location
export const validateContactLocation = (formData) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.business_email?.trim()) {
    errors.business_email = "Required";
  } else if (!emailRegex.test(formData.business_email)) {
    errors.business_email = "Invalid Email";
  }

  if (!formData.business_phone?.trim()) {
    errors.business_phone = "Required";
  } else if (formData.business_phone.length < 10) {
    errors.business_phone = "Invalid number";
  }

  if (!formData.address?.trim()) errors.address = "Required";
  if (!formData.city?.trim()) errors.city = "Required";
  if (!formData.country?.trim()) errors.country = "Required";

  return errors;
};


// Step 5: Operation & Compliance
export const validateOperationCompliance = (formData) => {
  const errors = {};

  if (!formData.opening_time) errors.opening_time = "Required";
  if (!formData.closing_time) errors.closing_time = "Required";

  // File objects don't have .trim() — check for existence only
  if (!formData.incorporation_cert) errors.incorporation_cert = "Missing Document";
  if (!formData.government_issued_id) errors.government_issued_id = "Missing ID";

  // Additional license required only for product-based businesses
  if (formData.business_type === 'products' && !formData.business_license) {
    errors.business_license = "License required for retail";
  }

  return errors;
};