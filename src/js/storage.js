import { STORAGE_KEY } from "./data.js";
import { normalizeHour, normalizeText, slotToMinutes } from "./utils.js";

function compareAppointmentsByServiceTime(a, b) {
  const dateA = String(a.data || "").trim();
  const dateB = String(b.data || "").trim();

  const dateCompare = dateA.localeCompare(dateB);

  if (dateCompare !== 0) {
    return dateCompare;
  }

  const timeA = slotToMinutes(a.hora);
  const timeB = slotToMinutes(b.hora);

  if (timeA !== timeB) {
    return timeA - timeB;
  }

  const barberCompare = normalizeText(a.barbeiro).localeCompare(
    normalizeText(b.barbeiro),
  );

  if (barberCompare !== 0) {
    return barberCompare;
  }

  return Number(a.id || 0) - Number(b.id || 0);
}

export function sortAppointmentsByServiceTime(appointments) {
  return [...appointments].sort(compareAppointmentsByServiceTime);
}

export function getStoredAppointments() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? sortAppointmentsByServiceTime(parsed) : [];
  } catch (error) {
    console.warn(
      "LocalStorage de agendamentos está inválido. Resetando lista.",
      error,
    );

    localStorage.removeItem(STORAGE_KEY);

    return [];
  }
}

export function saveAppointments(appointments) {
  const sortedAppointments = sortAppointmentsByServiceTime(appointments);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedAppointments));
}

export function getNextBarberSequence(appointments, barberName, dateValue) {
  const barberKey = normalizeText(barberName);
  const dateKey = String(dateValue || "").trim();

  const usedNumbers = appointments
    .filter((item) => {
      return (
        normalizeText(item.barbeiro) === barberKey &&
        String(item.data || "").trim() === dateKey
      );
    })
    .map((item) => Number(item.id))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!usedNumbers.length) return 1;

  return Math.max(...usedNumbers) + 1;
}

export function hasScheduleConflict(appointments, appointment) {
  const barberKey = normalizeText(appointment.barbeiro);
  const dateKey = String(appointment.data || "").trim();
  const hourKey = normalizeHour(appointment.hora);

  return appointments.some((item) => {
    return (
      normalizeText(item.barbeiro) === barberKey &&
      String(item.data || "").trim() === dateKey &&
      normalizeHour(item.hora) === hourKey
    );
  });
}

export function removeAppointmentByIndex(index) {
  const appointments = getStoredAppointments();

  if (index < 0 || index >= appointments.length) {
    return appointments;
  }

  appointments.splice(index, 1);
  saveAppointments(appointments);

  return appointments;
}
