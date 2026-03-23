/**
 * Validates the Create Product form data.
 * Updated to handle string-based quality ratings (High, Medium, Low).
 */
export const validateProductForm = (formData) => {
  let errors = {};

  // Title check
  if (!formData.title || !formData.title.trim()) {
    errors.title = "Product title is required";
  } else if (formData.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  // Category check
  if (!formData.category || formData.category.trim() === "") {
    errors.category = "Please select a category";
  }

  // Price check
  if (formData.price === "" || formData.price === null || formData.price === undefined) {
    errors.price = "Base price is required";
  } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
    errors.price = "Enter a valid price greater than 0";
  }

  // SKU check
  if (!formData.sku || !formData.sku.trim()) {
    errors.sku = "SKU is required";
  }

  // Quality check (Fixed for dropdown strings)
  const validQualities = ["High", "Medium", "Low"];
  if (!formData.qty || !validQualities.includes(formData.qty)) {
    errors.qty = "Please select a valid inventory quality";
  }

  // Description check
  if (!formData.description || !formData.description.trim()) {
    errors.description = "Please provide a product description";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  return errors;
};