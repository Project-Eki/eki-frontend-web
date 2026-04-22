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
    if (password.length < 8) {
      errors.password = "Minimum 8 characters";
    } else if (password.toLowerCase() === password || password.toUpperCase() === password) {
      errors.password = "Use both uppercase & lowercase letters";
    } else if (password === email) {
      errors.password = "Password cannot match email";
    } else if (/^\d+$/.test(password)) {
      errors.password = "Password cannot be only numbers";
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!agreeToTerms) errors.terms = "Accept terms to continue";

  return errors;
};
// Step 3: Business Identity with Multi-Category Support
export const validateBusinessIdentity = (formData) => {
  const errors = {};

  // Business Name
  if (!formData.business_name?.trim()) {
    errors.business_name = "Required";
  } else if (formData.business_name.trim().length < 2) {
    errors.business_name = "Too short";
  } else if (formData.business_name.trim().length > 100) {
    errors.business_name = "Too long";
  }

  // Business Type
  if (!formData.business_type) {
    errors.business_type = "Required";
  }

  // Business Category - FIXED validation for multi-select
  if (formData.business_type === "both") {
    // For "both", require at least 2 categories
    if (!formData.business_category || !Array.isArray(formData.business_category) || formData.business_category.length === 0) {
      errors.business_category = "Please select at least one category";
    } else if (formData.business_category.length === 1) {
      errors.business_category = "Please select at least 2 categories (you need both a product and service category)";
    } else if (formData.business_category.length < 2) {
      errors.business_category = `Please select ${2 - formData.business_category.length} more category/categories`;
    }
  } else if (formData.business_type === "products" || formData.business_type === "services") {
    // For single selection, handle both string and array cases
    const categoryValue = formData.business_category;
    
    // Check if it's an array (shouldn't happen for non-both, but handle gracefully)
    if (Array.isArray(categoryValue)) {
      if (categoryValue.length === 0) {
        errors.business_category = "Please select a category";
      } else if (categoryValue.length > 1) {
        errors.business_category = "Only one category allowed for this business type";
      }
      // If it's an array with one item, it's valid
    } else {
      // Handle string case
      if (!categoryValue || categoryValue.trim() === "") {
        errors.business_category = "Please select a category";
      }
    }
  }

  // Owner Full Name
  if (!formData.owner_full_name?.trim()) {
    errors.owner_full_name = "Required";
  } else if (!formData.owner_full_name.trim().includes(" ")) {
    errors.owner_full_name = "Enter first & last name";
  } else if (formData.owner_full_name.trim().length < 3) {
    errors.owner_full_name = "Too short";
  }

  // Tax ID
  if (!formData.tax_id?.trim()) {
    errors.tax_id = "Required";
  } else {
    const taxId = formData.tax_id.trim();
    if (!/^[a-zA-Z0-9\-\/\s]+$/.test(taxId)) {
      errors.tax_id = "Letters, numbers, hyphens & slashes only";
    } else if (taxId.length < 5) {
      errors.tax_id = "Minimum 5 characters";
    } else if (taxId.length > 20) {
      errors.tax_id = "Maximum 20 characters";
    }
  }

  // Registration Number
  if (!formData.registration_number?.trim()) {
    errors.registration_number = "Required";
  } else {
    const regNumber = formData.registration_number.trim();
    if (!/^[a-zA-Z0-9\-\/\s]+$/.test(regNumber)) {
      errors.registration_number = "Letters, numbers, hyphens & slashes only";
    } else if (regNumber.length < 4) {
      errors.registration_number = "Minimum 4 characters";
    } else if (regNumber.length > 30) {
      errors.registration_number = "Maximum 30 characters";
    }
  }

  // Business Description
  if (!formData.business_description?.trim()) {
    errors.business_description = "Required";
  } else {
    const wordCount = formData.business_description
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount === 0) {
      errors.business_description = "Required";
    } else if (wordCount > 30) {
      errors.business_description = "Maximum 30 words allowed";
    }
  }
  
  return errors;
};

// Step 4: Contact & Location
export const validateContactLocation = (formData) => {
  const errors = {};

  // Phone Number - Required
  if (!formData.business_phone?.trim()) {
    errors.business_phone = "Required";
  } else if (formData.business_phone.trim().length < 8) {
    errors.business_phone = "Invalid number";
  } else if (formData.business_phone.trim().length > 15) {
    errors.business_phone = "Number too long";
  }

  // Country - Required
  if (!formData.country?.trim()) {
    errors.country = "Required";
  }

  // City - Required
  if (!formData.city?.trim()) {
    errors.city = "Required";
  }

  // Street Address - OPTIONAL (no validation)

  // Operating Hours - Required with logical validation
  if (!formData.opening_time) {
    errors.opening_time = "Required";
  }
  if (!formData.closing_time) {
    errors.closing_time = "Required";
  }
  
  // Optional: Check if times make sense (add if needed)
  // if (formData.opening_time && formData.closing_time && formData.opening_time >= formData.closing_time) {
  //   errors.closing_time = "Closing time must be after opening time";
  // }

  return errors;
};

// Step 5: Operation & Compliance
export const validateOperationCompliance = (formData) => {
  const errors = {};

  // 1. Government Issued ID
  if (!formData.documents?.government_issued_id) {
    errors.government_issued_id = "Required";
  }
  if (!formData.government_issued_id_expiry) {
    errors.government_issued_id_expiry = "Expiry date required";
  }

  // 2. Professional Body Certification - OPTIONAL
  if (formData.documents?.professional_body_certification && !formData.professional_body_certification_expiry) {
    errors.professional_body_certification_expiry = "Expiry date required for certification";
  }

  // 3. Business License
  if (!formData.documents?.business_license) {
    errors.business_license = "Required";
  }
  if (!formData.business_license_expiry) {
    errors.business_license_expiry = "Expiry date required";
  }

  // 4. Tax Certificate
  if (!formData.documents?.tax_certificate) {
    errors.tax_certificate = "Required";
  }
  if (!formData.tax_certificate_expiry) {
    errors.tax_certificate_expiry = "Expiry date required";
  }

  // 5. Incorporation Certificate - Required, NO expiry validation
  if (!formData.documents?.incorporation_cert) {
    errors.incorporation_cert = "Required";
  }
  // REASON: No validation for incorporation_cert_expiry because it doesn't expire

  return errors;
};