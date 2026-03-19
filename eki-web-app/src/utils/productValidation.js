/**
 * Validates the Create Product form data.
 */
export const validateProductForm = (formData) => {
  let errors = {};

  // Title check
  if (!formData.title || !formData.title.trim()) {
    errors.title = "Product title is required";
  } else if (formData.title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  // Category check
  if (!formData.category) {
    errors.category = "Please select a category";
  }

  // Price check
  if (!formData.price) {
    errors.price = "Price is required";
  } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
    errors.price = "Enter a valid price greater than 0";
  }

  // SKU check
  if (!formData.sku || !formData.sku.trim()) {
    errors.sku = "SKU is required for inventory tracking";
  }

  // Quantity check
  if (formData.qty === '' || formData.qty === null) {
    errors.qty = "Quantity is required";
  } else if (isNaN(formData.qty) || parseInt(formData.qty) < 0) {
    errors.qty = "Quantity cannot be negative";
  }

  // Description check
  if (!formData.description || !formData.description.trim()) {
    errors.description = "Please provide a short description";
  } else if (formData.description.length < 10) {
    errors.description = "Description is too short (min 10 chars)";
  }

  return errors;
};