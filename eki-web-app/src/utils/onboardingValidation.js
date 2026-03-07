// Step1 Account Basics
// export const validateAccountBasics = (formData) => {
//   let errors = {};

//   if (!formData.first_name || !formData.first_name.trim()) {
//     errors.first_name = "First name is required";
//   }
  
//   if (!formData.last_name || !formData.last_name.trim()) {
//     errors.last_name = "Last name is required";
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!formData.email) {
//     errors.email = "Email is required";
//   } else if (!emailRegex.test(formData.email)) {
//     errors.email = "Please enter a valid email address";
//   }

//   if (!formData.password) {
//     errors.password = "Password is required";
//   } else if (formData.password.length < 6) {
//     errors.password = "Must be at least 6 characters";
//   }

//   if (!formData.confirmPassword) {
//     errors.confirmPassword = "Please confirm your password";
//   } else if (formData.confirmPassword !== formData.password) {
//     errors.confirmPassword = "Passwords do not match";
//   }

//   if (!formData.agreeToTerms) {
//     errors.terms = "You must accept the terms";
//   }

//   return errors;
// };
export const validateAccountBasics = (formData) => {
  const errors = {};
  const { first_name, last_name, email, password, confirmPassword, agreeToTerms } = formData;

  if (!first_name || first_name.trim() === '') errors.first_name = "First name is required.";
  if (!last_name || last_name.trim() === '') errors.last_name = "Last name is required.";
  if (!email || email.trim() === '') errors.email = "Email is required.";
  else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errors.email = "Invalid email format.";

  // Password rules matching backend
  if (!password) errors.password = "Password is required.";
  else {
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (password.toLowerCase() === password || password.toUpperCase() === password) 
      errors.password = "Password must include both uppercase and lowercase letters.";
    if (password === email) errors.password = "Password cannot be same as email.";
    if (/^\d+$/.test(password)) errors.password = "Password cannot be entirely numeric.";
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password && password !== confirmPassword) errors.confirmPassword = "Passwords must match.";

  if (!agreeToTerms) errors.terms = "You must agree to the terms.";

  return errors;
};
// Step 3 Business Identity
export const validateBusinessIdentity = (formData) => {
  let errors = {};

  if (!formData.business_name?.trim()) errors.business_name = "Required";
  if (!formData.business_type) errors.business_type = "Required";
  if (!formData.owner_full_name?.trim()) errors.owner_full_name = "Required";
  if (!formData.registration_number?.trim()) errors.registration_number = "Required";

  return errors;
};

// Contact & Location
export const validateContactLocation = (formData) => {
  let errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.business_email?.trim()) {
    errors.business_email = "Required";
  } else if (!emailRegex.test(formData.business_email)) {
    errors.business_email = "Invalid Email";
  }

  if (!formData.business_phone?.trim()) errors.business_phone = "Required";
  if (!formData.address?.trim()) errors.address = "Required";
  if (!formData.city?.trim()) errors.city = "Required";
  if (!formData.country?.trim()) errors.country = "Required";

  return errors;
};

// Operation & Compliance
export const validateOperationCompliance = (formData) => {
  let errors = {};
  if (!formData.opening_time) errors.opening_time = "Required";
  if (!formData.closing_time) errors.closing_time = "Required";
  if (!formData.documents.incorporation_cert) errors.incorporation_cert = "Missing Document";
  if (!formData.documents.national_id) errors.national_id = "Missing ID";

  return errors;
};