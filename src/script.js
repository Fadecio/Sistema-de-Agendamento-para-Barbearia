document.addEventListener("DOMContentLoaded", () => {
  const clienteInput = document.getElementById("cliente");
  const barbeiroInput = document.getElementById("barbeiro");
  const servicoInput = document.getElementById("servico");
  const dataInput = document.getElementById("data");
  const horaSelect = document.getElementById("hora"); 
  const form = document.getElementById("form-agendamento");
  const mensagem = document.getElementById("mensagem");

  for (let h = 8; h <= 20; h++) {
    ["00", "30"].forEach((min) => {
      const option = document.createElement("option");
      option.value = `${String(h).padStart(2, "0")}:${min}`;
      option.textContent = `${String(h).padStart(2, "0")}:${min}`;
      horaSelect.appendChild(option);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

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
    document.querySelectorAll(".erro").forEach(el => el.textContent = "");

    campos.forEach(c => {
      const campoDiv = c.elemento.closest(".campo");
      const erroMsg = campoDiv.querySelector(".erro");

      if (!c.elemento.value.trim()) {
        erroMsg.textContent = `O campo ${c.nome} é obrigatório.`;
        temErro = true;
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

    console.log("Agendamento:", agendamento);

    alert("Agendamento salvo com sucesso!");
    form.reset();

  });
});
