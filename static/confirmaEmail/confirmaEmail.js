document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('otp-form');
    const inputs = [...form.querySelectorAll('.otp-input')];

    // Lógica para mudar o foco automaticamente ao digitar
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Garante que apenas um dígito seja inserido
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.slice(0, 1);
            }

            const currentIndex = parseInt(e.target.dataset.index, 10);
            
            // Se digitou e não é o último campo, foca no próximo
            if (e.target.value.length === 1 && currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        });

        // Lógica para mudar o foco para o anterior ao pressionar Backspace em um campo vazio
        input.addEventListener('keydown', (e) => {
            const currentIndex = parseInt(e.target.dataset.index, 10);
            
            if (e.key === 'Backspace' && e.target.value === '' && currentIndex > 0) {
                inputs[currentIndex - 1].focus();
            }
        });
    });

    // Lógica do Timer (simulada)
    const timerDisplay = document.getElementById('timer');
    let timeLeft = 119; // 1 minuto e 59 segundos

    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const displayMinutes = String(minutes).padStart(1, '0');
        const displaySeconds = String(seconds).padStart(2, '0');

        timerDisplay.textContent = `${displayMinutes}:${displaySeconds}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            // Substitui o timer pelo link de reenvio
            timerDisplay.outerHTML = `<a href="#" class="timer-display" style="text-decoration: underline;">Solicitar novo código</a>`;
        }

        timeLeft--;
    }, 1000);

    // Foca automaticamente no primeiro campo ao carregar
    if (inputs.length > 0) {
        inputs[0].focus();
    }

    // --- LÓGICA DE VERIFICAÇÃO DO CÓDIGO ---
    const verifyButton = document.querySelector('.verify-button');
    
    if (verifyButton) {
        verifyButton.addEventListener('click', () => {
            // Coletar código dos 6 inputs
            const codigo = inputs.map(input => input.value).join('');
            
            if (codigo.length !== 6) {
                alert('Por favor, preencha todos os 6 dígitos do código.');
                return;
            }
            
            verifyButton.disabled = true;
            verifyButton.textContent = 'Verificando...';
            
            fetch('/api/confirmar-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: codigo
                })
            })
            .then(response => response.json())
            .then(data => {
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verificar e Ativar';
                
                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect;
                } else {
                    alert(data.message);
                    // Limpar campos em caso de erro
                    inputs.forEach(input => input.value = '');
                    inputs[0].focus();
                }
            })
            .catch(error => {
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verificar e Ativar';
                console.error('Erro:', error);
                alert('Erro ao verificar código. Tente novamente.');
            });
        });
    }
});