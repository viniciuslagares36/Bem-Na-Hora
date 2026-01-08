/* =========================================================
   1. SISTEMA DE ALERTAS (TOAST)
   (Cria o container HTML automaticamente se não existir)
   ========================================================= */
   function showToast(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Adiciona CSS básico via JS para garantir que funcione sem editar o CSS
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    const icons = {
        success: '✔',
        error: '✖',
        warning: '⚠'
    };

    const colors = {
        success: '#00A7E1',
        error: '#ff4b4b',
        warning: '#ffb703'
    };

    const toast = document.createElement('div');
    // Estilo inline para garantir funcionamento imediato
    toast.style.cssText = `
        display: flex; align-items: center; background: #fff; min-width: 300px;
        padding: 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        border-left: 5px solid ${colors[type]}; font-family: 'Inter', sans-serif;
        transform: translateX(120%); transition: transform 0.4s ease;
    `;
    
    toast.innerHTML = `
        <div style="font-size: 1.5rem; margin-right: 15px; color: ${colors[type]};">${icons[type]}</div>
        <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 1rem; color: #00171F;">${title}</div>
            <div style="font-size: 0.85rem; color: #555;">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Animação
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/* =========================================================
   2. FUNCIONALIDADE DO OLHINHO (Mostrar/Esconder)
   ========================================================= */
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '👁'; // Ícone fechado (opcional)
        } else {
            input.type = 'password';
            btn.textContent = '👁'; // Ícone aberto
        }
    });
});

/* =========================================================
   3. VALIDAÇÃO DE SENHA EM TEMPO REAL
   ========================================================= */
const newPassInput = document.getElementById('new-password');
const confirmPassInput = document.getElementById('confirm-password');
const btnReset = document.querySelector('.btn-reset');

// Elementos de Requisito
const reqLength = document.getElementById('req-length');
const reqNumber = document.getElementById('req-number');
const reqSpecial = document.getElementById('req-special');

// Função auxiliar para atualizar o visual dos requisitos
function updateRequirement(element, isValid, textValid, textInvalid) {
    if (isValid) {
        element.textContent = '✔ ' + textValid;
        element.style.color = '#00A7E1'; // Azul (Sucesso)
        element.style.fontWeight = '600';
    } else {
        element.textContent = '✖ ' + textInvalid;
        element.style.color = '#ff4b4b'; // Vermelho (Erro) ou cinza original
        element.style.fontWeight = 'normal';
    }
    return isValid;
}

// Evento de Digitação na Nova Senha
newPassInput.addEventListener('input', () => {
    const val = newPassInput.value;

    // 1. Valida Tamanho (8 chars)
    updateRequirement(reqLength, val.length >= 8, '8 caracteres', '8 caracteres');

    // 2. Valida Número
    updateRequirement(reqNumber, /\d/.test(val), 'um número', 'um número');

    // 3. Valida Especial
    updateRequirement(reqSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(val), 'um caractere especial', 'um caractere especial');

    // Checa se as senhas batem enquanto digita (caso o confirm já esteja preenchido)
    checkMatch();
});

// Evento de Digitação no Confirmar Senha
confirmPassInput.addEventListener('input', checkMatch);

function checkMatch() {
    const pass1 = newPassInput.value;
    const pass2 = confirmPassInput.value;

    // Se o campo de confirmação estiver vazio, remove estilos
    if (pass2 === '') {
        confirmPassInput.parentElement.style.borderColor = '#e2e8f0';
        return;
    }

    if (pass1 === pass2) {
        confirmPassInput.parentElement.style.borderColor = '#00A7E1'; // Borda Azul (Sucesso)
    } else {
        confirmPassInput.parentElement.style.borderColor = '#ff4b4b'; // Borda Vermelha (Erro)
    }
}

/* =========================================================
   4. ENVIO DO FORMULÁRIO (Botão Continuar)
   ========================================================= */
btnReset.addEventListener('click', (e) => {
    e.preventDefault(); // Impede o envio padrão

    const val = newPassInput.value;
    const confirmVal = confirmPassInput.value;

    // Verifica todos os requisitos novamente
    const isLengthOk = val.length >= 8;
    const isNumberOk = /\d/.test(val);
    const isSpecialOk = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    const isMatchOk = (val === confirmVal);

    if (!isLengthOk || !isNumberOk || !isSpecialOk) {
        showToast('Senha Fraca', 'Sua senha não atende a todos os requisitos listados.', 'error');
        return;
    }

    if (!isMatchOk) {
        showToast('Erro de Confirmação', 'As senhas não coincidem. Verifique novamente.', 'error');
        confirmPassInput.parentElement.style.borderColor = '#ff4b4b';
        return;
    }

    // Se passou por tudo:
    showToast('Sucesso!', 'Sua senha foi redefinida com sucesso.', 'success');
    
    // Simulação de redirecionamento para login
    setTimeout(() => {
        window.location.href = 'cadastro.html'; // Redireciona para o login
    }, 2000);
});