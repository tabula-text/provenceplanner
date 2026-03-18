import { TRIP_PASSWORD } from "./constants";

export function validatePassword(input: string): boolean {
  return input === TRIP_PASSWORD;
}

export const SESSION_COOKIE_NAME = "provence-auth";
export const SESSION_EXPIRY_DAYS = 7;

export function getSessionExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_EXPIRY_DAYS);
  return date;
}
