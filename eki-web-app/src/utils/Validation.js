export const validateLoginForm = (formData) => {
  const errors = { email: '', password: '' };
  let isValid = true;

  // Email Validation
  const emailValue = formData.email.trim();
  if (!emailValue) {
    errors.email = 'Email address is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password Validation
  const passwordValue = formData.password.trim();
  if (!passwordValue) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (passwordValue.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  return { isValid, errors };
};