function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;

  const cleanEmail = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail);
}

function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== "string") return false;

  const digits = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits);
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function isValidAddress(address) {
  if (!address || typeof address !== "string") return false;

  const cleanAddress = address.trim();
  const hasMinLength = cleanAddress.length >= 15;
  const hasLetters = /[a-zA-Z]/.test(cleanAddress);
  const hasNumbers = /\d/.test(cleanAddress);

  return hasMinLength && hasLetters && hasNumbers;
}

module.exports = {
  isValidEmail,
  isValidIndianPhone,
  normalizePhone,
  isValidAddress
};
