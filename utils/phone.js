// Chilean phone numbers as stored in the data: 9 digits (current plan) or
// 8 digits (pre-2013 plan). In 2013 landlines got a "2" after the area code
// and mobiles a leading "9", so old numbers are upgraded before dialing.
const toNineDigits = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^56(?=\d{9}$)/, '');
  if (digits.length === 9) return digits;
  if (digits.length !== 8) return null;
  if (digits.startsWith('2')) return `22${digits.slice(1)}`; // Santiago: 2 + XXXXXXX
  if (/^[89]/.test(digits)) return `9${digits}`; // old mobile
  return `${digits.slice(0, 2)}2${digits.slice(2)}`; // regional landline: area code (2 digits) + XXXXXX
};

// "+56 2 2271 2309", "+56 9 8765 4321", "+56 41 223 4567"
export const formatPhone = (phone) => {
  const n = toNineDigits(phone);
  if (!n) return null;
  if (/^[29]/.test(n)) return `+56 ${n[0]} ${n.slice(1, 5)} ${n.slice(5)}`;
  return `+56 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
};

export const toTelHref = (phone) => {
  const n = toNineDigits(phone);
  return n ? `tel:+56${n}` : null;
};
