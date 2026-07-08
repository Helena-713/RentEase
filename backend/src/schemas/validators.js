const { z } = require('./zod');

// E.164 international format: + followed by 8–15 digits
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const phoneSchema = z
  .string()
  .regex(
    PHONE_REGEX,
    'Phone number must be in international format (e.g. +251912345678, +14155552671)'
  );

const strongPasswordSchema = z
  .string()
  .regex(
    STRONG_PASSWORD_REGEX,
    'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character'
  );

module.exports = {
  phoneSchema,
  strongPasswordSchema,
};
