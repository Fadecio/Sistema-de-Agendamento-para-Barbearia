import { SERVICE_LABELS } from "./data.js";
import { formatCreatedHourDisplay, formatDateBR } from "./utils.js";

let messageTimer = null;

export function getPageElements() {
  return {
    clienteInput: document.getElementById("cliente"),
    barbeiroInput: document.getElementById("barbeiro"),
    servicoInput: document.getElementById("servico"),
    dataInput: document.getElementById("data"),
    horaSelect: document.getElementById("hora"),
    form: document.getElementById("form-agendamento"),
    mensagem: document.getElementById("mensagem"),
    listaAgendamentos: document.getElementById("lista-agendamentos"),
  };
}

export function hasRequiredElements(elements) {
  return Object.values(elements).every(Boolean);
}

export function getErrorElement(inputElement) {
  if (!inputElement) return null;

  const field = inputElement.closest(".form-field");

  if (!field) return null;

  return field.querySelector(".field-error");
}

export function setFieldError(inputElement, message) {
  const field = inputElement.closest(".form-field");
  const errorElement = getErrorElement(inputElement);

  if (!field || !errorElement) return;

  field.classList.add("has-error");
  errorElement.textContent = message;
}

export function clearFieldError(inputElement) {
  const field = inputElement.closest(".form-field");
  const errorElement = getErrorElement(inputElement);

  if (!field || !errorElement) return;

  field.classList.remove("has-error");
  errorElement.textContent = "";
}

export function clearFormErrors(form) {
  form.querySelectorAll(".field-error").forEach((element) => {
    element.textContent = "";
  });

  form.querySelectorAll(".form-field").forEach((field) => {
    field.classList.remove("has-error");
  });
}

export function showMessage(element, text = "", type = "") {
  if (messageTimer) {
    clearTimeout(messageTimer);
    messageTimer = null;
  }

  element.textContent = text;
  element.className = type ? `form-message ${type}` : "form-message";

  if (type === "success" && text.trim()) {
    messageTimer = window.setTimeout(() => {
      messageTimer = null;
      element.textContent = "";
      element.className = "form-message";
    }, 4000);
  }
}

export function setHourPlaceholder(horaSelect, text) {
  horaSelect.innerHTML = "";

  const option = document.createElement("option");
  option.value = "";
  option.textContent = text;

  horaSelect.appendChild(option);
  horaSelect.value = "";
}

export function renderHourOptions(horaSelect, hourOptions, previousValue = "") {
  horaSelect.innerHTML = "";

  const initialOption = document.createElement("option");
  initialOption.value = "";
  initialOption.textContent = "Selecione um horário";
  horaSelect.appendChild(initialOption);

  hourOptions.forEach((hourOption) => {
    const option = document.createElement("option");

    option.value = hourOption.value;
    option.textContent = hourOption.label;
    option.disabled = hourOption.disabled;

    horaSelect.appendChild(option);
  });

  const canRestore =
    previousValue &&
    [...horaSelect.options].some((option) => {
      return option.value === previousValue && !option.disabled;
    });

  if (canRestore) {
    horaSelect.value = previousValue;
  } else {
    horaSelect.selectedIndex = 0;
  }
}

export function renderAppointments(container, appointments) {
  container.innerHTML = "";

  if (!appointments.length) {
    const emptyState = document.createElement("article");

    emptyState.className = "empty-state";
    emptyState.textContent = "Nenhum agendamento confirmado até o momento.";

    container.appendChild(emptyState);

    return;
  }

  appointments.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "appointment-card";

    const title = document.createElement("h3");
    title.textContent = item.cliente || "Cliente não informado";

    const meta = document.createElement("div");
    meta.className = "appointment-meta";

    const barber = document.createElement("p");
    barber.textContent = `Barbeiro: ${item.barbeiro || "-"}`;

    const service = document.createElement("p");
    service.textContent = `Serviço: ${
      SERVICE_LABELS[item.servico] || item.servico || "-"
    }`;

    const date = document.createElement("p");
    date.textContent = `Data: ${formatDateBR(item.data)}`;

    const hour = document.createElement("p");
    hour.textContent = `Horário: ${item.hora || "-"}`;

    const idLine = document.createElement("p");
    idLine.textContent = `ID do cliente (barbeiro/dia): ${item.id || "-"}`;

    const createdLine = document.createElement("p");
    createdLine.textContent = `Hora do agendamento: ${formatCreatedHourDisplay(
      item.horaDoAgendamento || item.criadoEm,
    )}`;

    meta.append(barber, service, date, hour, idLine, createdLine);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-button";
    cancelButton.dataset.index = String(index);
    cancelButton.textContent = "Cancelar agendamento";

    card.append(title, meta, cancelButton);
    container.appendChild(card);
  });
}