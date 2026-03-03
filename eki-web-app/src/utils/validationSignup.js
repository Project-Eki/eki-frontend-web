export const validateSignup = (formData) => {
  const errors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    errors.email = "Enter a valid email";
  }

  if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.acceptedTerms) {
    errors.acceptedTerms = "You must accept the terms";
  }

  return errors;
};