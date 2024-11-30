
const validateEmail = (email) => {
  const errors = [];
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Check for common domains
  const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (!validDomains.includes(domain)) {
    errors.push('Please use a common email domain (gmail.com, yahoo.com, outlook.com, hotmail.com)');
  }

  // Check minimum length
  if (email.length < 5) {
    errors.push('Email must be at least 5 characters long');
  }

  // Check for special characters in local part
  const localPart = email.split('@')[0];
  if (localPart && /[<>()[\]\\,;:\s@"]/.test(localPart)) {
    errors.push('Email contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default validateEmail;