import { getNowMinutesLocal, getTodayISODate, slotToMinutes } from "./utils.js";

export function validateRequiredFields(fields) {
  const errors = [];

  fields.forEach((field) => {
    const value = String(field.element.value || "").trim();

    if (value === "") {
      errors.push({
        element: field.element,
        message: `O campo ${field.name} é obrigatório.`,
      });
    }
  });

  return errors;
}

export function isPastDate(dateValue) {
  return String(dateValue || "").trim() < getTodayISODate();
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
