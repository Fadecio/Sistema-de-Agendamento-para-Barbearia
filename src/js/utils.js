export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function normalizeHour(value) {
  const [rawHour = "", rawMinute = ""] = String(value || "")
    .trim()
    .split(":");

  const hour = rawHour.padStart(2, "0");
  const minute = rawMinute.padStart(2, "0");

  return `${hour}:${minute}`;
}

export function getTodayISODate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function slotToMinutes(timeValue) {
  const [hh, mm] = normalizeHour(timeValue)
    .split(":")
    .map((number) => Number(number));

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    return NaN;
  }

  return hh * 60 + mm;
}

export function getNowMinutesLocal() {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

export function formatDateBR(value) {
  if (!value) return "--/--/----";

  const [year, month, day] = String(value).split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export function formatCreatedHourDisplay(iso) {
  if (!iso) return "--";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return String(iso);
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
