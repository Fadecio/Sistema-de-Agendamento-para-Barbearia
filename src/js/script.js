import { initAnimations } from "./animations.js";

function getErrorElement(inputElement) {
  if (!inputElement) return null;
  const field = inputElement.closest(".form-field");
  if (!field) return null;
  return field.querySelector(".field-error");
}

document.addEventListener("DOMContentLoaded", () => {
  const clienteInput = document.getElementById("cliente");
  const barbeiroInput = document.getElementById("barbeiro");
  const servicoInput = document.getElementById("servico");
  const dataInput = document.getElementById("data");
  const horaSelect = document.getElementById("hora");
  const form = document.getElementById("form-agendamento");
  const mensagem = document.getElementById("mensagem");

  if (!form || !horaSelect || !mensagem) {
    console.error("Estrutura do formulário não encontrada no DOM.");
    return;
  }

  initAnimations();

  for (let hour = 8; hour <= 20; hour++) {
    ["00", "30"].forEach((min) => {
      const option = document.createElement("option");
      option.value = `${String(hour).padStart(2, "0")}:${min}`;
      option.textContent = `${String(hour).padStart(2, "0")}:${min}`;
      horaSelect.appendChild(option);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // lista de campos com referência ao <small> de erro
    const campos = [
      { elemento: clienteInput, nome: "Nome" },
      { elemento: barbeiroInput, nome: "Barbeiro" },
      { elemento: servicoInput, nome: "Serviço" },
      { elemento: dataInput, nome: "Data" },
      { elemento: horaSelect, nome: "Horário" }
    ];

    let temErro = false;

    // limpar mensagens antigas
    document.querySelectorAll(".field-error").forEach((element) => {
      element.textContent = "";
    });
    mensagem.textContent = "";

    campos.forEach((campo) => {
      const erroMsg = getErrorElement(campo.elemento);

      if (!erroMsg) return;

      if (!campo.elemento.value.trim()) {
        erroMsg.textContent = `O campo ${campo.nome} é obrigatório.`;
        temErro = true;
      } else {
        erroMsg.textContent = "";
      }
    });

    if (temErro) return;

    // se não houver erro, salva agendamento
    const agendamento = {
      cliente: clienteInput.value.trim(),
      barbeiro: barbeiroInput.value.trim(),
      servico: servicoInput.value.trim(),
      data: dataInput.value.trim(),
      hora: horaSelect.value.trim()
    };

    const lista = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    lista.push(agendamento);
    localStorage.setItem("agendamentos", JSON.stringify(lista));

    mensagem.textContent = "Agendamento salvo com sucesso!";
    form.reset();
  });
});
