import { initAnimations } from "./animations.js";
import { buildTimeSlots, getHourOptions } from "./agenda.js";
import {
  getNextBarberSequence,
  getStoredAppointments,
  hasScheduleConflict,
  removeAppointmentByIndex,
  saveAppointments,
  sortAppointmentsByServiceTime,
} from "./storage.js";
import { getTodayISODate, normalizeText } from "./utils.js";
import {
  isPastDate,
  isPastHourToday,
  validateRequiredFields,
} from "./validation.js";
import {
  clearFieldError,
  clearFormErrors,
  getPageElements,
  hasRequiredElements,
  renderAppointments,
  renderHourOptions,
  setFieldError,
  setHourPlaceholder,
  showMessage,
} from "./ui.js";
import { sendAppointmentToN8n } from "./n8n.js";

function createAppointment({
  appointments,
  cliente,
  barbeiro,
  servico,
  data,
  hora,
}) {
  return {
    id: getNextBarberSequence(appointments, barbeiro, data),
    horaDoAgendamento: new Date().toISOString(),
    cliente,
    barbeiro,
    servico,
    data,
    hora,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const elements = getPageElements();

  if (!hasRequiredElements(elements)) {
    console.error("Estrutura do formulário não encontrada no DOM.");
    return;
  }

  const {
    clienteInput,
    barbeiroInput,
    servicoInput,
    dataInput,
    horaSelect,
    form,
    mensagem,
    listaAgendamentos,
  } = elements;

  initAnimations();

  const todayISO = getTodayISODate();
  const allTimeSlots = buildTimeSlots();

  dataInput.setAttribute("min", todayISO);

  function refreshAppointments() {
    const appointments = sortAppointmentsByServiceTime(getStoredAppointments());
    renderAppointments(listaAgendamentos, appointments);
  }

  function refreshAvailableHours() {
    const selectedBarber = barbeiroInput.value;
    const selectedDate = dataInput.value;
    const previousValue = horaSelect.value;

    const hasBarber = normalizeText(selectedBarber) !== "";
    const hasDate = String(selectedDate || "").trim() !== "";

    if (!hasBarber && !hasDate) {
      setHourPlaceholder(horaSelect, "Selecione barbeiro e data primeiro");
      return;
    }

    if (!hasBarber) {
      setHourPlaceholder(horaSelect, "Selecione um barbeiro primeiro");
      return;
    }

    if (!hasDate) {
      setHourPlaceholder(horaSelect, "Selecione uma data primeiro");
      return;
    }

    const appointments = getStoredAppointments();

    const hourOptions = getHourOptions({
      appointments,
      barberName: selectedBarber,
      dateValue: selectedDate,
      timeSlots: allTimeSlots,
    });

    renderHourOptions(horaSelect, hourOptions, previousValue);
  }

  refreshAppointments();
  refreshAvailableHours();

  barbeiroInput.addEventListener("change", refreshAvailableHours);
  dataInput.addEventListener("change", () => {
    const today = getTodayISODate();

    if (dataInput.value && dataInput.value < today) {
      dataInput.value = "";
      setFieldError(dataInput, "Não é permitido escolher datas passadas.");
      setHourPlaceholder(horaSelect, "Selecione uma data válida primeiro");
      showMessage(mensagem, "Escolha uma data de hoje em diante.", "error");
      return;
    }

    clearFieldError(dataInput);
    refreshAvailableHours();
  });

  window.setInterval(() => {
    const isTodaySelected = dataInput.value === getTodayISODate();

    if (normalizeText(barbeiroInput.value) && isTodaySelected) {
      refreshAvailableHours();
    }
  }, 60_000);

  listaAgendamentos.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;

    const cancelButton = target.closest(".cancel-button");

    if (!cancelButton) return;

    const index = Number(cancelButton.dataset.index);

    if (!Number.isInteger(index)) return;

    removeAppointmentByIndex(index);
    refreshAppointments();
    refreshAvailableHours();

    showMessage(mensagem, "Agendamento cancelado com sucesso.", "success");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();    
    const submitButton = form.querySelector('button[type="submit"]');   

    clearFormErrors(form);
    showMessage(mensagem);

    const requiredFields = [
      { element: clienteInput, name: "Nome" },
      { element: barbeiroInput, name: "Barbeiro" },
      { element: servicoInput, name: "Serviço" },
      { element: dataInput, name: "Data" },
      { element: horaSelect, name: "Horário" },
    ];

    const requiredErrors = validateRequiredFields(requiredFields);

    requiredErrors.forEach((error) => {
      setFieldError(error.element, error.message);
    });

    if (requiredErrors.length) {
      return;
    }

    if (isPastDate(dataInput.value)) {
      setFieldError(dataInput, "Não é permitido agendar datas passadas.");
      showMessage(mensagem, "Revise a data escolhida.", "error");
      return;
    }

    const selectedHourOption = horaSelect.selectedOptions[0];

    if (selectedHourOption?.disabled) {
      setFieldError(horaSelect, "Escolha um horário disponível.");
      showMessage(mensagem, "Escolha um horário disponível.", "error");
      return;
    }

    if (isPastHourToday(dataInput.value, horaSelect.value)) {
      setFieldError(
        horaSelect,
        "Não é possível agendar horários que já passaram hoje.",
      );
      showMessage(
        mensagem,
        "Escolha um horário que ainda não tenha passado hoje.",
        "error",
      );
      return;
    }

    const appointments = getStoredAppointments();

    const appointment = createAppointment({
      appointments,
      cliente: clienteInput.value.trim(),
      barbeiro: barbeiroInput.value.trim(),
      servico: servicoInput.value.trim(),
      data: dataInput.value.trim(),
      hora: horaSelect.value.trim(),
    });

    if (hasScheduleConflict(appointments, appointment)) {
      setFieldError(horaSelect, "Este horário já está ocupado.");
      showMessage(
        mensagem,
        "Este barbeiro já possui agendamento nesse horário.",
        "error",
      );
      refreshAvailableHours();
      return;
    }

    submitButton.disabled = true;

    appointments.push(appointment);
    saveAppointments(appointments);

    let feedbackMessage = "Agendamento salvo com sucesso!";
    let feedbackType = "success";

    try {
      const n8nResult = await sendAppointmentToN8n(appointment);
    
      if (n8nResult?.skipped) {
        feedbackMessage = "Agendamento salvo com sucesso!";
      } else {
        feedbackMessage = "Agendamento salvo e enviado com sucesso!";
      }
    } catch (error) {
      console.error("Erro ao enviar agendamento para o n8n:", error);
      feedbackMessage =
        "Agendamento salvo localmente, mas não foi enviado ao n8n.";
      feedbackType = "error";
    } finally {
      form.reset();
      clearFormErrors(form);
    
      refreshAppointments();
      refreshAvailableHours();
    
      showMessage(mensagem, feedbackMessage, feedbackType);
      submitButton.disabled = false;
    }
  });

  form.addEventListener("reset", () => {
    clearFormErrors(form);
    showMessage(mensagem);

    window.setTimeout(() => {
      refreshAvailableHours();
    }, 0);
  });

  [clienteInput, barbeiroInput, servicoInput, dataInput, horaSelect].forEach(
    (input) => {
      input.addEventListener("input", () => {
        clearFieldError(input);
      });

      input.addEventListener("change", () => {
        clearFieldError(input);
      });
    },
  );
});
