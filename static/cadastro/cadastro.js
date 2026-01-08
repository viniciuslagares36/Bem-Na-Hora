/* ==========================================================================
   CONFIGURAÇÕES GERAIS E SELETORES
   ========================================================================== */
const loginBox = document.getElementById('login-box');
const btnToSignup = document.getElementById('btn-to-signup');
const btnToLogin = document.getElementById('btn-to-login');
const loginFormSection = document.getElementById('login-form-section');
const registerFormSection = document.getElementById('register-form-section');

/* ==========================================================================
   PARTE 1: TRANSIÇÃO DE TELAS (LOGIN <-> CADASTRO)
   ========================================================================== */
function switchToSignupMode() {
    loginBox.classList.add('animating');
    loginBox.classList.add('sign-up-mode');
    setTimeout(() => {
        loginFormSection.classList.add('hidden');
        registerFormSection.classList.remove('hidden');
    }, 200);
}

function switchToLoginMode() {
    loginBox.classList.add('animating');
    loginBox.classList.remove('sign-up-mode');
    setTimeout(() => {
        loginFormSection.classList.remove('hidden');
        registerFormSection.classList.add('hidden');
    }, 200);
}

if(btnToSignup) btnToSignup.addEventListener('click', (e) => { e.preventDefault(); switchToSignupMode(); });
if(btnToLogin) btnToLogin.addEventListener('click', (e) => { e.preventDefault(); switchToLoginMode(); });


/* ==========================================================================
   PARTE 2: MÁSCARAS DE INPUT (TELEFONE E CPF)
   ========================================================================== */

// Selecionar inputs específicos
const phoneInput = document.getElementById('telefone');
const cpfInput = document.getElementById('cpf');

// --- MÁSCARA DE TELEFONE (DD) 9XXXX-XXXX ---
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
        
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 números

        // Aplica a formatação progressiva
        if (value.length > 2) {
            value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        }
        if (value.length > 7) { // Conta com os caracteres extras
            value = `${value.substring(0, 10)}-${value.substring(10)}`;
        }
        
        e.target.value = value;
    });
}

// --- MÁSCARA DE CPF XXX.XXX.XXX-XX ---
if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove não dígitos
        
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 3) {
            value = `${value.substring(0, 3)}.${value.substring(3)}`;
        }
        if (value.length > 7) {
            value = `${value.substring(0, 7)}.${value.substring(7)}`;
        }
        if (value.length > 11) {
            value = `${value.substring(0, 11)}-${value.substring(11)}`;
        }

        e.target.value = value;
    });
}


/* ==========================================================================
   PARTE 3: VALIDAÇÕES DE REGRA DE NEGÓCIO
   ========================================================================== */

// Algoritmo de Validação de CPF Real
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Limpa formatação
    if (cpf == '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length != 11 || 
        cpf == "00000000000" || 
        cpf == "11111111111" || 
        cpf == "22222222222" || 
        cpf == "33333333333" || 
        cpf == "44444444444" || 
        cpf == "55555555555" || 
        cpf == "66666666666" || 
        cpf == "77777777777" || 
        cpf == "88888888888" || 
        cpf == "99999999999")
            return false;
    
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de Senha Forte
function validarSenha(senha) {
    /* Regras:
       - Mínimo 8 caracteres
       - Pelo menos 1 letra maiúscula ou minúscula
       - Pelo menos 1 número
       - Pelo menos 1 caractere especial (!@#$%^&*...)
    */
    const minChars = 8;
    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

    if (senha.length < minChars) return "A senha deve ter no mínimo 8 caracteres.";
    if (!temLetra) return "A senha deve conter pelo menos uma letra.";
    if (!temNumero) return "A senha deve conter pelo menos um número.";
    if (!temEspecial) return "A senha deve conter pelo menos um caractere especial.";

    return true; // Passou em tudo
}


/* ==========================================================================
   PARTE 4: SUBMISSÃO DO FORMULÁRIO
   ========================================================================== */

const registerForm = document.querySelector('.register-grid');
const registerBtn = document.querySelector('.register-submit');

if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Impede o envio padrão para validarmos primeiro

        // 1. Coleta os valores
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const cpf = cpfInput.value;
        const telefone = phoneInput.value;
        const senha = document.getElementById('senha').value;
        const terms = document.getElementById('terms').checked;

        // 2. Validações Sequenciais
        if (!nome || !email || !cpf || !telefone || !senha) {
            showToast('Atenção', 'Preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        if (!validarCPF(cpf)) {
            showToast('CPF Inválido', 'Por favor, verifique o CPF digitado.', 'error');
            cpfInput.style.borderColor = 'red'; // Destaque visual
            return;
        } else {
            cpfInput.style.borderColor = '#ddd'; // Reseta borda
        }

        const validacaoSenha = validarSenha(senha);
        if (validacaoSenha !== true) {
            showToast('Senha Fraca', validacaoSenha, 'warning');
            return;
        }

        if (!terms) {
            showToast('Termos de Uso', 'Você precisa aceitar os termos para continuar.', 'warning');
            return;
        }

        // 3. Coletar dados adicionais
        const genero = document.getElementById('genero').value;
        const convenio = document.getElementById('convenio').value;
        const data_nasc = document.getElementById('data-nasc').value;

        if (!genero || !data_nasc) {
            showToast('Atenção', 'Preencha gênero e data de nascimento.', 'warning');
            return;
        }

        // 4. Enviar para API
        registerBtn.disabled = true;
        registerBtn.textContent = 'Enviando...';

        fetch('/api/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                cpf: cpf,
                genero: genero,
                data_nasc: data_nasc,
                telefone: telefone,
                senha: senha,
                convenio: convenio
            })
        })
        .then(response => response.json())
        .then(data => {
            registerBtn.disabled = false;
            registerBtn.textContent = 'INSCREVER';
            
            if (data.success) {
                showToast('Sucesso!', data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            } else {
                showToast('Erro', data.message, 'error');
            }
        })
        .catch(error => {
            registerBtn.disabled = false;
            registerBtn.textContent = 'INSCREVER';
            console.error('Erro:', error);
            showToast('Erro', 'Erro ao processar cadastro. Tente novamente.', 'error');
        });
    });
}

// --- LÓGICA DE LOGIN ---
const loginForm = document.querySelector('.login-section form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = loginForm.querySelector('input[type="email"]').value;
        const senha = loginForm.querySelector('input[type="password"]').value;
        
        if (!email || !senha) {
            showToast('Atenção', 'Preencha email e senha.', 'warning');
            return;
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';
        
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENTRAR';
            
            if (data.success) {
                showToast('Sucesso!', data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            } else {
                showToast('Erro', data.message, 'error');
            }
        })
        .catch(error => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENTRAR';
            console.error('Erro:', error);
            showToast('Erro', 'Erro ao fazer login. Tente novamente.', 'error');
        });
    });
}


/* ==========================================================================
   PARTE 5: CÓDIGOS AUXILIARES (Modal, Select, Flatpickr, Toast)
   ========================================================================== */

// ... (MANTENHA AQUI O CÓDIGO DO MODAL, DOS SELECTS CUSTOMIZADOS, 
//      DO FLATPICKR E A FUNÇÃO showToast() QUE JÁ ESTAVAM NO SEU ARQUIVO) ...

/* --- FUNÇÃO TOAST (Caso não tenha copiado ainda) --- */
function showToast(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: '<i class="fa-solid fa-circle-check"></i>',
        error: '<i class="fa-solid fa-circle-xmark"></i>',
        warning: '<i class="fa-solid fa-triangle-exclamation"></i>'
    };
    const fallbackIcons = { success: '✔', error: '✖', warning: '⚠' };
    
    const hasFontAwesome = document.querySelector('link[href*="font-awesome"]');
    const iconHtml = hasFontAwesome ? icons[type] : fallbackIcons[type];

    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    toast.innerHTML = `
        <div class="toast-icon">${iconHtml}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 400); 
    }, 4000);
}


/* ==========================================================================
   PARTE 6: SELECTS CUSTOMIZADOS (Genérico)
   ========================================================================== */

const allCustomSelects = document.querySelectorAll('.custom-select-wrapper');

allCustomSelects.forEach(wrapper => {
    const customSelect = wrapper.querySelector('.custom-select');
    const realSelect = wrapper.querySelector('select');
    const selectedSpan = customSelect.querySelector('.selected-option');
    const options = customSelect.querySelectorAll('.custom-options li');

    customSelect.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-select').forEach(other => {
            if (other !== customSelect) other.classList.remove('open');
        });
        customSelect.classList.toggle('open');
        e.stopPropagation();
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedSpan.textContent = option.textContent;
            selectedSpan.style.color = "#555"; 
            realSelect.value = option.getAttribute('data-value');
            customSelect.classList.remove('open');
        });
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(select => {
        select.classList.remove('open');
    });
});

/* --- PARTE 7: CALENDÁRIO FLATPICKR + MÁSCARA --- */

// 1. Seleciona o elemento
const dateInput = document.getElementById('data-nasc');

// 2. Verifica se o input existe para não dar erro em outras páginas
if (dateInput) {
    
    // 3. Inicializa o Flatpickr
    const calendario = flatpickr(dateInput, {
        locale: "pt",
        dateFormat: "d/m/Y",
        disableMobile: true, // Força o visual desktop
        allowInput: true,    // Permite digitar
        theme: "airbnb",
        position: "above"
    });

    // 4. Adiciona a Máscara (Barras automáticas)
    dateInput.addEventListener("input", function(e) {
        let value = e.target.value;
        
        // Remove tudo que não for número
        value = value.replace(/\D/g, "");
        
        // Adiciona a primeira barra (DD/)
        if (value.length > 2) {
            value = value.substring(0, 2) + "/" + value.substring(2);
        }
        
        // Adiciona a segunda barra (MM/)
        if (value.length > 5) {
            value = value.substring(0, 5) + "/" + value.substring(5);
        }
        
        // Atualiza o valor
        e.target.value = value;

        // Se a data estiver completa (10 chars), sincroniza com o calendário
        if(value.length === 10) {
            calendario.setDate(value, false);
        }
    });
}