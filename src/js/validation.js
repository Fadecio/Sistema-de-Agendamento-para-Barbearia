import { getNowMinutesLocal, getTodayISODate, slotToMinutes } from "./utils.js";

export function validateRequiredFields(fields) {
  const errors = [];

  fields.forEach((field) => {
    if (!field.element.value.trim()) {
      errors.push({
        element: field.element,
        message: `O campo ${field.name} é obrigatório.`,
      });
    }
  });

  return errors;
}

export function isPastDate(dateValue) {
  return dateValue < getTodayISODate();
}

export function isPastHourToday(dateValue, hourValue) {
  if (dateValue !== getTodayISODate()) {
    return false;
  }

  const slotMinutes = slotToMinutes(hourValue);

  if (!Number.isFinite(slotMinutes)) {
    return false;
  }

  return slotMinutes < getNowMinutesLocal();
}