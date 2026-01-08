document.addEventListener('DOMContentLoaded', function() {
    
    /* ==========================================================================
       1. LÓGICA DO MODAL (TERMOS DE USO)
       ========================================================================== */
    const openModalBtn = document.getElementById('open-terms-modal');
    const modalOverlay = document.getElementById('terms-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (openModalBtn && modalOverlay && closeModalBtn) {
        // Abrir
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Impede a tela de pular para o topo
            modalOverlay.classList.add('show');
        });

        // Fechar no X
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('show');
        });

        // Fechar clicando fora
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    } else {
        console.warn('Elementos do modal não encontrados. Verifique os IDs no HTML.');
    }

    /* ==========================================================================
       2. LÓGICA DO TOGGLE (PROFISSIONAL vs CLÍNICA)
       ========================================================================== */
    const radioPro = document.getElementById('type-pro');
    const radioClinic = document.getElementById('type-clinic');
    const formTitle = document.getElementById('form-title');
    const royalDesc = document.getElementById('royal-desc');
    const registroInput = document.getElementById('registro-input');
    
    const fieldsProf = document.querySelectorAll('.field-prof');
    const fieldsClinic = document.querySelectorAll('.field-clinic');

    function setProfessional() {
        if(!formTitle) return;
        formTitle.innerText = "Cadastro Profissional";
        if(royalDesc) royalDesc.innerText = "Gerencie seus atendimentos e aumente sua visibilidade.";
        if(registroInput) registroInput.placeholder = "CRM / CRO / CRF";
        
        fieldsProf.forEach(el => {
            el.style.display = 'block';
            el.disabled = false;
            el.required = true;
        });
        fieldsClinic.forEach(el => {
            el.style.display = 'none';
            el.disabled = true;
            el.required = false;
        });
    }

    function setClinic() {
        if(!formTitle) return;
        formTitle.innerText = "Cadastro de Clínica";
        if(royalDesc) royalDesc.innerText = "Cadastre sua empresa e gerencie sua equipe técnica.";
        if(registroInput) registroInput.placeholder = "Registro Técnico (RT)";
        
        fieldsClinic.forEach(el => {
            el.style.display = 'block';
            el.disabled = false;
            el.required = true;
        });
        fieldsProf.forEach(el => {
            el.style.display = 'none';
            el.disabled = true;
            el.required = false;
        });
    }

    if (radioPro && radioClinic) {
        radioPro.addEventListener('change', setProfessional);
        radioClinic.addEventListener('change', setClinic);

        // Checagem inicial
        if (radioClinic.checked) {
            setClinic();
        } else {
            setProfessional();
        }
    }

    /* ==========================================================================
       3. MÁSCARAS (CPF, CNPJ, TELEFONE)
       ========================================================================== */
    function applyMask(input, maskFunction) {
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = maskFunction(e.target.value);
            });
        }
    }

    const maskCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);
    const maskCNPJ = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18);
    const maskPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").substring(0, 15);

    // Seleciona inputs pelos atributos para garantir que pegue o certo
    const inputCPF = document.querySelector('input[placeholder="CPF"]');
    const inputCNPJ = document.querySelector('input[placeholder="CNPJ"]');
    const inputPhone = document.querySelector('input[type="tel"]');

    if(inputCPF) applyMask(inputCPF, maskCPF);
    if(inputCNPJ) applyMask(inputCNPJ, maskCNPJ);
    if(inputPhone) applyMask(inputPhone, maskPhone);

    /* ==========================================================================
       4. SUBMISSÃO DO FORMULÁRIO
       ========================================================================== */
    const formCadastro = document.getElementById('form-cadastro-parceiro');
    const btnSubmit = document.getElementById('btn-submit-cadastro');
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar se termos foram aceitos
            const termsCheckbox = document.getElementById('terms-partner');
            if (!termsCheckbox || !termsCheckbox.checked) {
                alert('Você precisa aceitar os Termos de Uso para continuar.');
                return;
            }
            
            // Determinar se é profissional ou clínica
            const isProfissional = radioPro && radioPro.checked;
            const isClinica = radioClinic && radioClinic.checked;
            
            // Coletar dados do formulário
            let dados = {};
            
            if (isProfissional) {
                const nome = document.getElementById('input-nome-prof')?.value.trim();
                const email = document.getElementById('input-email')?.value.trim().toLowerCase();
                const cpf = document.getElementById('input-cpf')?.value.trim();
                const telefone = document.getElementById('input-telefone')?.value.trim();
                const registro = document.getElementById('registro-input')?.value.trim();
                const senha = document.getElementById('input-senha')?.value;
                
                if (!nome || !email || !cpf || !telefone || !registro || !senha) {
                    alert('Preencha todos os campos obrigatórios.');
                    return;
                }
                
                dados = {
                    nome: nome,
                    email: email,
                    cpf: cpf,
                    telefone: telefone,
                    registro: registro,
                    senha: senha
                };
                
                // Enviar para API de profissional
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'CADASTRANDO...';
                
                fetch('/api/cadastro/profissional', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Sucesso!', data.message || 'Cadastro realizado com sucesso!', 'success');
                        setTimeout(() => {
                            if (data.redirect) {
                                window.location.href = data.redirect;
                            }
                        }, 1500);
                    } else {
                        showToast('Erro', data.message || 'Erro ao realizar cadastro. Tente novamente.', 'error');
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'INSCREVER';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    showToast('Erro', 'Erro ao conectar com o servidor. Tente novamente.', 'error');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'INSCREVER';
                });
                
            } else if (isClinica) {
                const nome = document.getElementById('input-nome-clinic')?.value.trim();
                const email = document.getElementById('input-email')?.value.trim().toLowerCase();
                const cnpj = document.getElementById('input-cnpj')?.value.trim();
                const telefone = document.getElementById('input-telefone')?.value.trim();
                const registro = document.getElementById('registro-input')?.value.trim();
                const senha = document.getElementById('input-senha')?.value;
                
                if (!nome || !email || !cnpj || !telefone || !registro || !senha) {
                    alert('Preencha todos os campos obrigatórios.');
                    return;
                }
                
                dados = {
                    nome: nome,
                    email: email,
                    cnpj: cnpj,
                    telefone: telefone,
                    registro: registro,
                    senha: senha
                };
                
                // Enviar para API de clínica
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'CADASTRANDO...';
                
                fetch('/api/cadastro/clinica', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Sucesso!', data.message || 'Cadastro realizado com sucesso!', 'success');
                        setTimeout(() => {
                            if (data.redirect) {
                                window.location.href = data.redirect;
                            }
                        }, 1500);
                    } else {
                        showToast('Erro', data.message || 'Erro ao realizar cadastro. Tente novamente.', 'error');
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'INSCREVER';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    showToast('Erro', 'Erro ao conectar com o servidor. Tente novamente.', 'error');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'INSCREVER';
                });
            }
        });
    }

    /* ==========================================================================
       5. FUNÇÃO TOAST
       ========================================================================== */
    function showToast(title, message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }

        const icons = { success: '✔', error: '✖', warning: '⚠' };
        const colors = { success: '#00A7E1', error: '#ff4b4b', warning: '#ffb703' };

        const toast = document.createElement('div');
        toast.style.cssText = `
            display: flex; align-items: center; background: #fff; min-width: 300px;
            padding: 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            border-left: 5px solid ${colors[type]}; font-family: 'Poppins', sans-serif;
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
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

});