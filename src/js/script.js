import { initAnimations } from "./animations.js";

function getErrorElement(inputElement) {
  if (!inputElement) return null;
  const field = inputElement.closest(".form-field");
  if (!field) return null;
  return field.querySelector(".field-error");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeHour(value) {
  const [rawHour = "", rawMinute = ""] = String(value || "")
    .trim()
    .split(":");
  const hour = rawHour.padStart(2, "0");
  const minute = rawMinute.padStart(2, "0");
  return `${hour}:${minute}`;
}

function buildTimeSlots(startHour = 8, endHour = 20) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const minutes = hour === endHour ? ["00"] : ["00", "30"];
    minutes.forEach((min) => {
      slots.push(`${String(hour).padStart(2, "0")}:${min}`);
    });
  }
  return slots;
}

function getTodayISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slotToMinutes(timeValue) {
  const [hh, mm] = normalizeHour(timeValue)
    .split(":")
    .map((n) => Number(n));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
  return hh * 60 + mm;
}

function getNowMinutesLocal() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function formatDateBR(value) {
  if (!value) return "--/--/----";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function newAppointmentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ag-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function formatCriadoEmDisplay(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStoredAppointments() {
  const raw = localStorage.getItem("agendamentos");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(
      "LocalStorage de agendamentos está inválido. Resetando lista.",
      error,
    );
    localStorage.removeItem("agendamentos");
    return [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const clienteInput = document.getElementById("cliente");
  const barbeiroInput = document.getElementById("barbeiro");
  const servicoInput = document.getElementById("servico");
  const dataInput = document.getElementById("data");
  const horaSelect = document.getElementById("hora");
  const form = document.getElementById("form-agendamento");
  const mensagem = document.getElementById("mensagem");
  const listaAgendamentos = document.getElementById("lista-agendamentos");

  if (
    !clienteInput ||
    !barbeiroInput ||
    !servicoInput ||
    !dataInput ||
    !horaSelect ||
    !form ||
    !mensagem ||
    !listaAgendamentos
  ) {
    console.error("Estrutura do formulário não encontrada no DOM.");
    return;
  }

  function renderAppointments() {
    const lista = getStoredAppointments();
    listaAgendamentos.innerHTML = "";

    if (!lista.length) {
      const emptyState = document.createElement("article");
      emptyState.className = "empty-state";
      emptyState.textContent = "Nenhum agendamento confirmado até o momento.";
      listaAgendamentos.appendChild(emptyState);
      return;
    }

    lista.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "appointment-card";

      const titulo = document.createElement("h3");
      titulo.textContent = item.cliente || "Cliente não informado";
      card.appendChild(titulo);

      const meta = document.createElement("div");
      meta.className = "appointment-meta";

      const barbeiro = document.createElement("p");
      barbeiro.textContent = `Barbeiro: ${item.barbeiro || "-"}`;

      const servico = document.createElement("p");
      servico.textContent = `Serviço: ${item.servico || "-"}`;

      const data = document.createElement("p");
      data.textContent = `Data: ${formatDateBR(item.data)}`;

      const horario = document.createElement("p");
      horario.textContent = `Horário: ${item.hora || "-"}`;

      const idLinha = document.createElement("p");
      idLinha.textContent = `ID: ${item.id || "-"}`;

      const criadoLinha = document.createElement("p");
      criadoLinha.textContent = `Criado em: ${formatCriadoEmDisplay(item.criadoEm)}`;

      meta.append(barbeiro, servico, data, horario, idLinha, criadoLinha);
      card.appendChild(meta);

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "cancel-button";
      cancelButton.dataset.index = String(index);
      cancelButton.textContent = "Cancelar agendamento";
      card.appendChild(cancelButton);

      listaAgendamentos.appendChild(card);
    });
  }

  initAnimations();

  let successMessageTimer = null;

  function showMessage(text, type) {
    if (successMessageTimer) {
      clearTimeout(successMessageTimer);
      successMessageTimer = null;
    }

    mensagem.textContent = text;
    mensagem.className = type ? `form-message ${type}` : "form-message";

    if (type === "success" && text.trim()) {
      successMessageTimer = window.setTimeout(() => {
        successMessageTimer = null;
        mensagem.textContent = "";
        mensagem.className = "form-message";
      }, 4000);
    }
  }

  const todayISO = getTodayISODate();
  dataInput.min = todayISO;
  renderAppointments();
  const allTimeSlots = buildTimeSlots();

  function setHourPlaceholder(text) {
    horaSelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = text;
    horaSelect.appendChild(option);
    horaSelect.value = "";
  }

  function updateAvailableHours() {
    const selectedBarber = normalizeText(barbeiroInput.value);
    const selectedDate = String(dataInput.value || "").trim();

    if (!selectedBarber || !selectedDate) {
      setHourPlaceholder("Selecione data e barbeiro primeiro");
      return;
    }

    const previousValue = horaSelect.value;

    const lista = getStoredAppointments();
    const occupiedHours = new Set(
      lista
        .filter((item) => {
          return (
            normalizeText(item.barbeiro) === selectedBarber &&
            String(item.data || "").trim() === selectedDate
          );
        })
        .map((item) => normalizeHour(item.hora)),
    );

    const isToday = selectedDate === getTodayISODate();
    const nowMin = getNowMinutesLocal();

    horaSelect.innerHTML = "";

    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.textContent = "Selecione um horário";
    horaSelect.appendChild(initialOption);

    allTimeSlots.forEach((hour) => {
      const option = document.createElement("option");
      option.value = hour;
      const ocupado = occupiedHours.has(hour);
      const slotMin = slotToMinutes(hour);
      const passou =
        isToday &&
        Number.isFinite(slotMin) &&
        slotMin < nowMin;
      option.disabled = ocupado || passou;
      if (ocupado) {
        option.textContent = `${hour} — ocupado`;
      } else if (passou) {
        option.textContent = `${hour} — expirado`;
      } else {
        option.textContent = hour;
      }
      horaSelect.appendChild(option);
    });

    const canRestore =
      previousValue &&
      [...horaSelect.options].some(
        (o) => o.value === previousValue && !o.disabled,
      );
    if (canRestore) {
      horaSelect.value = previousValue;
    } else {
      horaSelect.selectedIndex = 0;
    }
  }

  updateAvailableHours();
  barbeiroInput.addEventListener("change", updateAvailableHours);
  dataInput.addEventListener("change", updateAvailableHours);

  window.setInterval(() => {
    if (
      normalizeText(barbeiroInput.value) &&
      String(dataInput.value || "").trim() === getTodayISODate()
    ) {
      updateAvailableHours();
    }
  }, 60_000);

  listaAgendamentos.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const cancelButton = target.closest(".cancel-button");
    if (!cancelButton) return;

    const index = Number(cancelButton.dataset.index);
    if (!Number.isInteger(index)) return;

    const lista = getStoredAppointments();
    if (index < 0 || index >= lista.length) return;

    lista.splice(index, 1);
    localStorage.setItem("agendamentos", JSON.stringify(lista));
    renderAppointments();
    updateAvailableHours();
    showMessage("Agendamento cancelado com sucesso.", "success");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const campos = [
      { elemento: clienteInput, nome: "Nome" },
      { elemento: barbeiroInput, nome: "Barbeiro" },
      { elemento: servicoInput, nome: "Serviço" },
      { elemento: dataInput, nome: "Data" },
      { elemento: horaSelect, nome: "Horário" },
    ];

    let temErro = false;

    document.querySelectorAll(".field-error").forEach((element) => {
      element.textContent = "";
    });
    showMessage("", "");

    campos.forEach((campo) => {
      const erroMsg = getErrorElement(campo.elemento);
      const field = campo.elemento.closest(".form-field");
      if (!erroMsg || !field) return;

      if (!campo.elemento.value.trim()) {
        field.classList.add("has-error");
        erroMsg.textContent = `O campo ${campo.nome} é obrigatório.`;
        temErro = true;
      } else {
        field.classList.remove("has-error");
      }
    });

    if (temErro) return;

    const dataError = getErrorElement(dataInput);
    const todayStr = getTodayISODate();
    if (dataInput.value < todayStr) {
      if (dataError) {
        dataError.textContent = "Não é permitido agendar datas passadas.";
      }
      return;
    }

    const horaOpt = horaSelect.selectedOptions[0];
    if (horaOpt?.disabled) {
      showMessage("Escolha um horário disponível.", "error");
      return;
    }

    const horaError = getErrorElement(horaSelect);
    if (dataInput.value === todayStr) {
      const slotMin = slotToMinutes(horaSelect.value);
      if (
        Number.isFinite(slotMin) &&
        slotMin < getNowMinutesLocal()
      ) {
        if (horaError) {
          horaError.textContent =
            "Não é possível agendar horários que já passaram hoje.";
        }
        horaSelect.closest(".form-field")?.classList.add("has-error");
        showMessage(
          "Escolha um horário que ainda não tenha passado hoje.",
          "error",
        );
        return;
      }
    }

    const agendamento = {
      id: newAppointmentId(),
      criadoEm: new Date().toISOString(),
      cliente: clienteInput.value.trim(),
      barbeiro: barbeiroInput.value.trim(),
      servico: servicoInput.value.trim(),
      data: dataInput.value.trim(),
      hora: horaSelect.value.trim(),
    };

    const lista = getStoredAppointments();
    const barberKey = normalizeText(agendamento.barbeiro);
    const dateKey = String(agendamento.data || "").trim();
    const hourKey = normalizeHour(agendamento.hora);

    const horarioDuplicado = lista.some((item) => {
      return (
        normalizeText(item.barbeiro) === barberKey &&
        String(item.data || "").trim() === dateKey &&
        normalizeHour(item.hora) === hourKey
      );
    });

    if (horarioDuplicado) {
      showMessage("Este barbeiro já possui agendamento nesse horário.", "error");
      return;
    }

    lista.push(agendamento);
    localStorage.setItem("agendamentos", JSON.stringify(lista));
    renderAppointments();
    updateAvailableHours();

    showMessage("Agendamento salvo com sucesso!", "success");
    form.reset();
    updateAvailableHours();
  });

  form.addEventListener("reset", () => {
    document.querySelectorAll(".field-error").forEach((element) => {
      element.textContent = "";
    });

    document.querySelectorAll(".form-field").forEach((field) => {
      field.classList.remove("has-error");
    });

    showMessage("", "");

    window.setTimeout(() => {
      updateAvailableHours();
    }, 0);
  });
});
