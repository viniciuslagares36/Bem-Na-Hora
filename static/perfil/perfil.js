/* =========================================================
   VARIÁVEIS DE CONTROLE GLOBAL
   ========================================================= */
let pendingSectionId = null;
let pendingBtn = null;

const confirmModal = document.getElementById('confirm-modal');
const btnConfirmSave = document.getElementById('btn-confirm-save');
const btnCancelSave = document.getElementById('btn-cancel-save');

/* =========================================================
   1. MÁSCARAS E FORMATAÇÃO (Ao Digitar)
   ========================================================= */
const masks = {
    cpf(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    },
    phone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    },
    date(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\d{4})\d+?$/, '$1');
    },
    cep(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    }
};

// Aplicar máscaras nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
        const field = e.target;
        if (field.id === 'input-cpf') field.value = masks.cpf(field.value);
        if (field.id === 'input-telefone') field.value = masks.phone(field.value);
        if (field.id === 'input-nascimento') field.value = masks.date(field.value);
        if (field.id === 'input-cep') field.value = masks.cep(field.value);
    });
});

/* =========================================================
   2. VALIDAÇÕES (Lógica Real)
   ========================================================= */
const validators = {
    cpf(strCPF) {
        let soma = 0;
        let resto;
        // Limpa formatação para validar
        const cleanCPF = strCPF.replace(/\D/g, '');

        if (cleanCPF === "00000000000" || cleanCPF.length !== 11) return false;

        for (let i = 1; i <= 9; i++) soma = soma + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cleanCPF.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma = soma + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cleanCPF.substring(10, 11))) return false;
        return true;
    },
    date(dateString) {
        // Formato DD/MM/AAAA
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(dateString)) return false;

        const parts = dateString.split("/");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (year < 1900 || year > new Date().getFullYear() || month === 0 || month > 12) return false;

        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

        return day > 0 && day <= monthLength[month - 1];
    }
};

/* =========================================================
   3. BUSCA DE CEP AUTOMÁTICA (Corrigida e Melhorada)
   ========================================================= */
const cepInput = document.getElementById('input-cep');

if (cepInput) {
    cepInput.addEventListener('input', async (e) => {
        // 1. Pega apenas os números
        const cep = e.target.value.replace(/\D/g, '');

        // 2. Só pesquisa se tiver exatamente 8 dígitos
        if (cep.length === 8) {
            showToast('Consultando...', 'Buscando endereço...', 'warning');
            
            try {
                // Desabilita campos enquanto busca para evitar conflito
                toggleAddressInputs(true);

                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    // Função auxiliar para preencher se o elemento existir
                    const fill = (id, val) => {
                        const el = document.getElementById(id);
                        if (el && val) el.value = val;
                    };

                    fill('input-rua', data.logradouro);
                    fill('input-bairro', data.bairro);
                    fill('input-cidade', data.localidade);
                    fill('input-uf', data.uf);

                    showToast('Sucesso', 'Endereço localizado!', 'success');
                    
                    // Foca no número ou complemento (opcional, se tivesse campo número)
                    // document.getElementById('input-numero')?.focus();
                } else {
                    showToast('Atenção', 'CEP não encontrado na base de dados.', 'error');
                    // Limpa para o usuário digitar manualmente
                    document.getElementById('input-rua').value = "";
                    document.getElementById('input-bairro').value = "";
                }
            } catch (error) {
                console.error(error);
                showToast('Erro', 'Falha ao conectar com o serviço de CEP.', 'error');
            } finally {
                // Reabilita campos para edição manual caso precise corrigir
                toggleAddressInputs(false);
            }
        }
    });
}

// Função auxiliar para travar/destravar campos durante a busca
function toggleAddressInputs(isLocked) {
    const fields = ['input-rua', 'input-bairro', 'input-cidade', 'input-uf'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.readOnly = isLocked;
    });
}

/* =========================================================
   4. LÓGICA DE EDIÇÃO (CORRIGIDA: LIMPAR INPUT E PLACEHOLDER)
   ========================================================= */

function toggleEdit(sectionId, btn) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll('.field-input');
    
    const icon = btn.querySelector('i');
    const textSpan = btn.querySelector('.btn-text');
    // Encontrar o botão de cancelar
    const cancelBtn = section.querySelector('.btn-cancel-edit') || document.querySelector(`#header-address .btn-cancel-card`);

    const isReadonly = inputs[0].hasAttribute('readonly');

    if (isReadonly) {
        // --- ATIVAR MODO EDIÇÃO ---
        inputs.forEach(input => {
            // 1. Salva o valor original (Backup)
            const valorAtual = input.value;
            input.dataset.original = valorAtual; 
            
            // 2. Transforma o texto em placeholder (Visual)
            input.placeholder = valorAtual;

            // 3. Limpa o input para digitar (Regra solicitada)
            input.value = '';

            // 4. Libera escrita
            input.removeAttribute('readonly');
            
            // Estilo visual de foco
            input.style.borderColor = '#00A7E1';
            input.style.backgroundColor = '#fff';
        });

        // Atualiza botões
        icon.classList.remove('fa-pen');
        icon.classList.add('fa-save');
        if (textSpan) textSpan.textContent = "Salvar";
        
        if (cancelBtn) cancelBtn.classList.remove('hidden');

        inputs[0].focus();

    } else {
        // --- TENTATIVA DE SALVAR ---
        
        // Validação prévia
        const cpfVal = document.getElementById('input-cpf')?.value;
        const dataVal = document.getElementById('input-nascimento')?.value;

        // Se estiver editando dados pessoais, valida CPF e Data
        if (sectionId === 'personal-data-section') {
            // Se o campo não estiver vazio (usuário digitou algo), valida.
            // Se estiver vazio, a lógica de salvar vai restaurar o original depois, então não valida agora.
            if (cpfVal && !validators.cpf(cpfVal)) {
                showToast('CPF Inválido', 'Verifique os dígitos.', 'error');
                document.getElementById('input-cpf').style.borderColor = 'red';
                return;
            }
            if (dataVal && !validators.date(dataVal)) {
                showToast('Data Inválida', 'Data incorreta.', 'error');
                document.getElementById('input-nascimento').style.borderColor = 'red';
                return;
            }
        }

        // Abre modal de confirmação
        pendingSectionId = sectionId;
        pendingBtn = btn;
        confirmModal.classList.add('show');
    }
}

// Função de Cancelar (Restaura tudo)
function cancelEdit(sectionId) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll('.field-input');
    
    let editBtn;
    let cancelBtn;

    if(sectionId === 'personal-data-section') {
        editBtn = section.querySelector('.btn-edit-sidebar');
        cancelBtn = section.querySelector('.btn-cancel-edit');
    } else {
        editBtn = document.querySelector(`#header-address .btn-edit-card`);
        cancelBtn = document.querySelector(`#header-address .btn-cancel-card`);
    }

    inputs.forEach(input => {
        // Restaura o valor original do backup
        if (input.dataset.original !== undefined) {
            input.value = input.dataset.original;
        }
        
        // Remove placeholder (opcional, mas bom pra limpar)
        input.placeholder = '';

        // Trava novamente
        input.setAttribute('readonly', true);
        input.style.borderColor = '';
        input.style.backgroundColor = '';
    });

    // Reseta botões
    const icon = editBtn.querySelector('i');
    const textSpan = editBtn.querySelector('.btn-text');
    
    icon.classList.remove('fa-save');
    icon.classList.add('fa-pen');
    if (textSpan) textSpan.textContent = "Alterar";
    
    if (cancelBtn) cancelBtn.classList.add('hidden');

    showToast('Cancelado', 'Nenhuma alteração feita.', 'warning');
}

/* =========================================================
   5. LÓGICA DO MODAL DE CONFIRMAÇÃO
   ========================================================= */

btnCancelSave.addEventListener('click', () => {
    confirmModal.classList.remove('show');
    pendingSectionId = null;
    pendingBtn = null;
});

btnConfirmSave.addEventListener('click', () => {
    if (!pendingSectionId || !pendingBtn) return;

    const section = document.getElementById(pendingSectionId);
    const inputs = section.querySelectorAll('.field-input');
    const icon = pendingBtn.querySelector('i');
    const textSpan = pendingBtn.querySelector('.btn-text');
    
    let cancelBtn;
    if(pendingSectionId === 'personal-data-section') {
        cancelBtn = section.querySelector('.btn-cancel-edit');
    } else {
        cancelBtn = document.querySelector(`#header-address .btn-cancel-card`);
    }

    // Preparar dados para enviar ao servidor
    const dadosAtualizacao = {};
    
    inputs.forEach(input => {
        const valor = input.value.trim();
        const id = input.id;
        
        // REGRA IMPORTANTE: Se o usuário deixou em branco, restaura o original
        if (valor === '') {
            input.value = input.dataset.original || '';
        } else {
            // Se digitou algo, atualiza o "original" para o novo valor
            input.dataset.original = valor;
            
            // Mapear IDs dos inputs para campos do banco
            if (id === 'input-cpf') dadosAtualizacao['cpf'] = valor;
            else if (id === 'input-nascimento') dadosAtualizacao['data_nasc'] = valor;
            else if (id === 'input-telefone') dadosAtualizacao['telefone'] = valor;
            else if (id === 'input-rua') dadosAtualizacao['rua'] = valor;
            else if (id === 'input-bairro') dadosAtualizacao['bairro'] = valor;
            else if (id === 'input-cidade') dadosAtualizacao['cidade'] = valor;
            else if (id === 'input-uf') dadosAtualizacao['estado'] = valor;
            else if (id === 'input-cep') dadosAtualizacao['cep'] = valor;
        }
        
        input.placeholder = ''; // Limpa placeholder
        input.setAttribute('readonly', true);
        input.style.borderColor = '';
        input.style.backgroundColor = '';
    });

    // Enviar dados para o servidor
    if (Object.keys(dadosAtualizacao).length > 0) {
        fetch('/api/perfil/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizacao)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Sucesso!', 'Informações atualizadas no banco de dados.', 'success');
            } else {
                showToast('Erro', data.message || 'Erro ao atualizar perfil.', 'error');
                // Reverter alterações em caso de erro
                inputs.forEach(input => {
                    if (input.dataset.original) {
                        input.value = input.dataset.original;
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar perfil:', error);
            showToast('Erro', 'Erro ao conectar com o servidor.', 'error');
            // Reverter alterações em caso de erro
            inputs.forEach(input => {
                if (input.dataset.original) {
                    input.value = input.dataset.original;
                }
            });
        });
    } else {
        showToast('Aviso', 'Nenhuma alteração detectada.', 'warning');
    }

    icon.classList.remove('fa-save');
    icon.classList.add('fa-pen');
    if (textSpan) textSpan.textContent = "Alterar";
    
    if (cancelBtn) cancelBtn.classList.add('hidden');

    confirmModal.classList.remove('show');
    
    pendingSectionId = null;
    pendingBtn = null;
});

// Fechar modal clicando fora
confirmModal.addEventListener('click', (e) => {
    if(e.target === confirmModal) confirmModal.classList.remove('show');
});

/* =========================================================
   OUTROS (Acordeão, Foto, Toast)
   ========================================================= */

function toggleAccordion(wrapperId, headerId) {
    const wrapper = document.getElementById(wrapperId);
    const header = document.getElementById(headerId);
    
    if (!wrapper || !header) {
        console.warn('Elementos do accordion não encontrados:', wrapperId, headerId);
        return;
    }
    
    const isEditing = header.querySelector('.fa-save'); 
    
    // Se estiver editando e tentando fechar, cancela a edição automaticamente
    if(isEditing && wrapper.classList.contains('open')) {
        // Encontrar qual seção está sendo editada
        if (wrapperId === 'wrapper-address') {
            cancelEdit('address-section');
        }
        // Não fecha ainda, o cancelEdit já faz isso
        return;
    }
    
    if(isEditing) return; // Não fecha se estiver editando

    const isAlreadyOpen = wrapper.classList.contains('open');

    // Fecha todos os outros accordions e cancela edições
    document.querySelectorAll('.accordion-wrapper').forEach(el => {
        if (el !== wrapper && el.classList.contains('open')) {
            // Verificar se está sendo editado antes de fechar
            const otherHeader = document.querySelector(`[onclick*="${el.id}"]`);
            if (otherHeader && otherHeader.querySelector('.fa-save')) {
                if (el.id === 'wrapper-address') {
                    cancelEdit('address-section');
                }
            }
            el.classList.remove('open');
        }
    });
    document.querySelectorAll('.accordion-header').forEach(el => {
        if (el !== header) {
            el.classList.remove('active');
        }
    });

    // Toggle do accordion atual
    if (!isAlreadyOpen) {
        wrapper.classList.add('open');
        header.classList.add('active');
    } else {
        wrapper.classList.remove('open');
        header.classList.remove('active');
    }
}

// Upload Foto
const inputPhoto = document.getElementById("upload-photo");
const imgProfile = document.getElementById("ftPerfil");
if (inputPhoto) {
    inputPhoto.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        
        // Validar tipo de arquivo
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Erro', 'Tipo de arquivo não permitido. Use: PNG, JPG, JPEG, GIF ou WEBP', 'error');
            this.value = ''; // Limpar input
            return;
        }
        
        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Erro', 'Arquivo muito grande. Máximo: 5MB', 'error');
            this.value = ''; // Limpar input
            return;
        }
        
        // Mostrar preview imediatamente
            const reader = new FileReader();
            reader.onload = function () { 
                imgProfile.src = reader.result; 
            };
            reader.readAsDataURL(file);
        
        // Enviar para o servidor
        const formData = new FormData();
        formData.append('foto', file);
        
        showToast('Aguarde', 'Enviando foto...', 'warning');
        
        fetch('/api/perfil/upload-foto', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualizar a imagem com a URL do servidor
                if (data.foto_url) {
                    imgProfile.src = data.foto_url;
                }
                showToast('Sucesso!', 'Foto de perfil atualizada e salva no banco de dados.', 'success');
            } else {
                showToast('Erro', data.message || 'Erro ao fazer upload da foto', 'error');
                // Restaurar imagem padrão em caso de erro
                imgProfile.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            }
        })
        .catch(error => {
            console.error('Erro ao fazer upload:', error);
            showToast('Erro', 'Erro ao conectar com o servidor', 'error');
            // Restaurar imagem padrão em caso de erro
            imgProfile.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        });
    });
}

// Toast
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

// Header dropdown já é gerenciado pelo header.js global, não precisa duplicar aqui

/* =========================================================
   CARREGAR HISTÓRICO MÉDICO
   ========================================================= */
function carregarHistoricoMedico() {
    fetch('/api/perfil/agendamentos')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('history-table');
            const tbody = document.getElementById('history-tbody');
            const empty = document.getElementById('history-empty');
            
            if (!table || !tbody || !empty) return;
            
            if (data.success && data.agendamentos && data.agendamentos.length > 0) {
                // Limpar tbody
                tbody.innerHTML = '';
                
                // Adicionar agendamentos
                data.agendamentos.forEach(ag => {
                    const tr = document.createElement('tr');
                    
                    // Mapear status para classes CSS
                    let statusClass = 'confirm';
                    let statusText = ag.status || 'Agendado';
                    if (statusText === 'Concluido' || statusText === 'Concluído') {
                        statusText = 'Concluído';
                    } else if (statusText === 'Cancelado') {
                        statusClass = 'cancel';
                    } else if (statusText === 'Faltou') {
                        statusClass = 'cancel';
                    }
                    
                    tr.innerHTML = `
                        <td>${ag.data}</td>
                        <td>${ag.medico_clinica}</td>
                        <td>${ag.tipo}</td>
                        <td><span class="status ${statusClass}">${statusText}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
                
                table.style.display = 'table';
                empty.style.display = 'none';
            } else {
                table.style.display = 'none';
                empty.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar histórico:', error);
            const table = document.getElementById('history-table');
            const empty = document.getElementById('history-empty');
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'block';
        });
}

// Carregar histórico quando o accordion abrir
document.addEventListener('DOMContentLoaded', () => {
    const historyHeader = document.getElementById('header-history');
    const historyWrapper = document.getElementById('wrapper-history');
    
    if (historyHeader && historyWrapper) {
        // Observar quando o accordion abre
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (historyWrapper.classList.contains('open')) {
                        carregarHistoricoMedico();
        }
      }
    });
        });
        
        observer.observe(historyWrapper, {
            attributes: true,
            attributeFilter: ['class']
      });
    }
  });
