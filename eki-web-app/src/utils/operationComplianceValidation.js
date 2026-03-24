export const validateOperationCompliance = (formData) => {
  const errors = {};
  
  if (!formData.opening_time) errors.opening_time = "Required";
  if (!formData.closing_time) errors.closing_time = "Required";

  // Check documents
  if (!formData.incorporation_cert) errors.incorporation_cert = "Required";
  if (!formData.government_issued_id) errors.government_issued_id = "Required";
  if (!formData.country_issued_id) errors.country_issued_id = "Required";
  if (!formData.tax_certificate) errors.tax_certificate = "Required";
  
  if (!formData.business_license) {
      errors.business_license = "Required";
  }

  return errors;
};
export default validateOperationCompliance;