import { BUSINESS_HOURS } from "./data.js";
import {
  getNowMinutesLocal,
  getTodayISODate,
  normalizeHour,
  normalizeText,
  slotToMinutes,
} from "./utils.js";

export function buildTimeSlots(
  startHour = BUSINESS_HOURS.start,
  endHour = BUSINESS_HOURS.end,
) {
  const slots = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const minutes = hour === endHour ? ["00"] : ["00", "30"];

    minutes.forEach((minute) => {
      slots.push(`${String(hour).padStart(2, "0")}:${minute}`);
    });
  }

  return slots;
}

export function getHourOptions({
  appointments,
  barberName,
  dateValue,
  timeSlots,
}) {
  const barberKey = normalizeText(barberName);
  const dateKey = String(dateValue || "").trim();

  const occupiedHours = new Set(
    appointments
      .filter((item) => {
        return (
          normalizeText(item.barbeiro) === barberKey &&
          String(item.data || "").trim() === dateKey
        );
      })
      .map((item) => normalizeHour(item.hora)),
  );

  const isToday = dateKey === getTodayISODate();
  const nowMinutes = getNowMinutesLocal();

  return timeSlots.map((hour) => {
    const occupied = occupiedHours.has(hour);
    const slotMinutes = slotToMinutes(hour);

    const expired =
      isToday &&
      Number.isFinite(slotMinutes) &&
      slotMinutes < nowMinutes;

    let label = hour;

    if (occupied) {
      label = `${hour} — ocupado`;
    } else if (expired) {
      label = `${hour} — expirado`;
    }

    return {
      value: hour,
      label,
      disabled: occupied || expired,
      occupied,
      expired,
    };
  });
}