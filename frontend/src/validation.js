// Check the shared 20-to-60-character name rule.
export function validateName(value) {
  return value.trim().length >= 20 && value.trim().length <= 60
    ? ""
    : "Name must be between 20 and 60 characters.";
}

// Check that an email address has a standard shape.
export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? ""
    : "Enter a valid email address.";
}

// Check the password length, uppercase letter, and special character rules.
export function validatePassword(value) {
  if (value.length < 8 || value.length > 16) {
    return "Password must be between 8 and 16 characters.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[^A-Za-z0-9\s]/.test(value)) {
    return "Password must include a special character.";
  }
  return "";
}

// Check that an address does not exceed the maximum length.
export function validateAddress(value) {
  return value.length <= 400 ? "" : "Address must be at most 400 characters.";
}

// Check that a rating is a whole number from one to five.
export function validateRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? ""
    : "Rating must be a whole number from 1 to 5.";
}
