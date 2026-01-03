document.addEventListener("DOMContentLoaded", () => {
    const clienteInput = document.getElementById("cliente");
    const barbeiroInput = document.getElementById("barbeiro");
    const servicoInput = document.getElementById("servico");
    const dataInput = document.getElementById("data");
    const horaInput = document.getElementById("horarios");
    const agendarButton = document.querySelector(".agendar");
    const form = document.querySelector("form");

    if (!agendarButton || !clienteInput || !barbeiroInput || !servicoInput || !dataInput || !horaInput) {
        console.warn("Elementos do formulário não encontrados.");
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const cliente = clienteInput.value.trim();
        const barbeiro = barbeiroInput.value.trim();
        const servico = servicoInput.value.trim();
        const data = dataInput.value.trim();
        const hora = horaInput.value.trim();

        if (!cliente || !barbeiro || !servico || !data || !hora) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const agendamento = { cliente, barbeiro, servico, data, hora };
        
        const lista = JSON.parse(localStorage.getItem("agendamentos") || "[]");
        lista.push(agendamento);
        localStorage.setItem("agendamentos", JSON.stringify(lista));

        console.log("Agendamento:", agendamento);
        alert("Agendamento salvo com sucesso.");
        form?.reset();
    });
});