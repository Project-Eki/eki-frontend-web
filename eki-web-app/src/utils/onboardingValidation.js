// Step 1: Account Basics (Looks good, just added minor polish)
export const validateAccountBasics = (formData) => {
  const errors = {};
  const { first_name, last_name, email, password, confirmPassword, agreeToTerms } = formData;

  if (!first_name?.trim()) errors.first_name = "Required";
  if (!last_name?.trim()) errors.last_name = "Required";
  if (!email?.trim()) {
    errors.email = "Required";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
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

  if (password !== confirmPassword) errors.confirmPassword = "Passwords match fail";
  if (!agreeToTerms) errors.terms = "Accept terms to continue";

  return errors;
};


// Step 3 Business Identity - Pinpoint Edition
export const validateBusinessIdentity = (formData) => {
  let errors = {};

  // Business Name Pinpoint
  if (!formData.business_name?.trim()) {
    errors.business_name = "Business name is required";
  } else if (formData.business_name.length < 3) {
    errors.business_name = "Name must be at least 3 characters";
  }

  // Tax ID (TIN) Pinpoint
  if (!formData.tax_id?.trim()) {
    errors.tax_id = "TIN is required";
  } else if (!/^\d+$/.test(formData.tax_id)) {
    errors.tax_id = "TIN must contain only numbers";
  } else if (formData.tax_id.length !== 10) {
    errors.tax_id = `Need 10 digits (currently ${formData.tax_id.length})`;
  }

  // Registration Number Pinpoint
  if (!formData.registration_number?.trim()) {
    errors.registration_number = "Registration number is required";
  } else if (formData.registration_number.length < 5) {
    errors.registration_number = "Enter a valid RC/BN number";
  }

  // Owner Name Pinpoint
  if (!formData.owner_full_name?.trim()) {
    errors.owner_full_name = "Legal owner name is required";
  } else if (!formData.owner_full_name.includes(" ")) {
    errors.owner_full_name = "Enter both First and Last name";
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

  // Phone check (Assuming +256 or local format)
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

// Step 5: Operation & Compliance (Fixed Document pathing)
export const validateOperationCompliance = (formData) => {
  const errors = {};
  
  if (!formData.opening_time) errors.opening_time = "Required";
  if (!formData.closing_time) errors.closing_time = "Required";

  // Check if documents exist (Note: File objects don't have .trim())
  if (!formData.incorporation_cert) errors.incorporation_cert = "Missing Document";
  if (!formData.government_issued_id) errors.government_issued_id = "Missing ID";
  
  // Checking additional license if it's a "Retail" business
  if (formData.business_type === 'products' && !formData.business_license) {
      errors.business_license = "License required for retail";
  }

  return errors;
};