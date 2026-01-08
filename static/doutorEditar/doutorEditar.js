document.addEventListener('DOMContentLoaded', () => {

    // --- 0. CONFIGURAÇÃO DE LIMITES (SEGURANÇA E BANCO DE DADOS) ---
    const limitesGerais = {
        'nome-exibicao': 60,
        'especialidade-input': 50,
        'anos-experiencia': 20,
        'endereco': 100,
        'bairro': 50,
        'cidade': 50,
        'telefone': 15,
        'formacao-curso': 100,
        'formacao-inst': 50,
        'service-name': 40,
        'service-price': 15,
        // NOVO: Limites para os horários
        'horario-semana': 50,
        'horario-fim-semana': 50
    };

    for (const [id, max] of Object.entries(limitesGerais)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.setAttribute('maxlength', max);
        }
    }

    // --- 1. LÓGICA DE FOTO DE PERFIL ---
    const inputFoto = document.getElementById('input-foto');
    const previewContainer = document.getElementById('photo-preview');

    inputFoto.addEventListener('change', function (evento) {
        const arquivo = evento.target.files[0];
        if (arquivo) {
            // Validação
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(arquivo.type)) {
                alert('Tipo de arquivo não permitido. Use: PNG, JPG, JPEG, GIF ou WEBP.');
                return;
            }
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (arquivo.size > maxSize) {
                alert('Arquivo muito grande. Máximo 5MB.');
                return;
            }
            
            const leitor = new FileReader();
            leitor.onload = function (e) {
                previewContainer.innerHTML = `<img src="${e.target.result}" alt="Foto de Perfil">`;
                
                // Enviar foto para o servidor
                const formData = new FormData();
                formData.append('foto', arquivo);
                
                fetch('/api/profissional/upload-foto', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Foto enviada com sucesso');
                    } else {
                        alert('Erro ao enviar foto: ' + (data.message || 'Erro desconhecido'));
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar foto:', error);
                    alert('Erro ao conectar com o servidor para upload da foto');
                });
            }
            leitor.readAsDataURL(arquivo);
        }
    });

    // --- 2. LÓGICA DE SERVIÇOS ---
    const serviceNameInput = document.getElementById('service-name');
    const servicePriceInput = document.getElementById('service-price');
    const addBtn = document.getElementById('add-service-btn');
    const listContainer = document.getElementById('services-container');
    const counter = document.getElementById('service-counter');

    let serviceCount = 0;
    const MAX_SERVICES = 10;
    const MAX_CHARS_NAME = limitesGerais['service-name'];
    const MAX_CHARS_PRICE = limitesGerais['service-price'];

    addServiceCard("Consulta Cardiológica", "350,00");

    addBtn.addEventListener('click', () => {
        const name = serviceNameInput.value.trim();
        const price = servicePriceInput.value.trim();

        if (!name || !price) {
            alert('Por favor, preencha o nome e o valor do serviço.');
            return;
        }
        if (name.length > MAX_CHARS_NAME || price.length > MAX_CHARS_PRICE) {
            alert(`Texto muito longo!`);
            return;
        }
        if (serviceCount >= MAX_SERVICES) {
            alert('Você atingiu o limite máximo de 10 serviços.');
            return;
        }

        addServiceCard(name, price);

        serviceNameInput.value = '';
        servicePriceInput.value = '';
        serviceNameInput.focus();
    });

    function addServiceCard(name, price) {
        const card = document.createElement('div');
        card.className = 'service-card-edit';

        card.innerHTML = `
            <div class="service-details">
                <strong>${name}</strong>
                <span>R$ ${price}</span>
            </div>
            <div class="service-actions">
                <button type="button" class="action-btn edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="action-btn delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.querySelector('.delete').addEventListener('click', () => {
            if (confirm("Deseja remover este serviço?")) {
                card.remove();
                serviceCount--;
                updateCounter();
            }
        });

        card.querySelector('.edit').addEventListener('click', () => {
            serviceNameInput.value = name;
            servicePriceInput.value = price;
            card.remove();
            serviceCount--;
            updateCounter();
            serviceNameInput.focus();
        });

        listContainer.appendChild(card);
        serviceCount++;
        updateCounter();
    }

    function updateCounter() {
        counter.textContent = `${serviceCount}/${MAX_SERVICES} serviços criados`;
        if (serviceCount >= MAX_SERVICES) {
            addBtn.disabled = true;
            addBtn.textContent = 'Limite Atingido';
        } else {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar';
        }
    }

    // --- 2.5 LÓGICA DE FORMAÇÃO ACADÊMICA ---
    const cursoInput = document.getElementById('formacao-curso');
    const instInput = document.getElementById('formacao-inst');
    const addFormacaoBtn = document.getElementById('btn-add-formacao');
    const formacaoContainer = document.getElementById('formacao-container');

    // Adiciona exemplo inicial
    addFormacaoCard("Graduação em Medicina", "USP - 2010");

    addFormacaoBtn.addEventListener('click', () => {
        const curso = cursoInput.value.trim();
        const instituicao = instInput.value.trim();

        if (!curso || !instituicao) {
            alert('Preencha o Curso e a Instituição/Ano.');
            return;
        }

        addFormacaoCard(curso, instituicao);

        cursoInput.value = '';
        instInput.value = '';
        cursoInput.focus();
    });

    function addFormacaoCard(curso, instituicao) {
        const card = document.createElement('div');
        // Reutiliza estilo de card de serviço mas com classe extra se quiser customizar
        card.className = 'service-card-edit formacao-card';

        card.innerHTML = `
            <div class="service-details">
                <strong>${curso}</strong>
                <span style="color: #666; font-size: 0.9rem;">${instituicao}</span>
            </div>
            <div class="service-actions">
                <button type="button" class="action-btn delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.querySelector('.delete').addEventListener('click', () => {
            card.remove();
        });

        formacaoContainer.appendChild(card);
    }


    // --- 3. LÓGICA DE ADICIONAR FOCOS (TAGS) ---
    const focosContainer = document.getElementById('focos-container');
    const btnAddFoco = document.getElementById('btn-add-foco');
    const MAX_TAG_CHARS = 25;

    btnAddFoco.addEventListener('click', () => {
        const inputTemp = document.createElement('input');
        inputTemp.type = 'text';
        inputTemp.className = 'input-new-tag';
        inputTemp.placeholder = 'Digite e enter...';
        inputTemp.setAttribute('maxlength', MAX_TAG_CHARS);

        focosContainer.insertBefore(inputTemp, btnAddFoco);
        btnAddFoco.style.display = 'none';
        inputTemp.focus();

        function confirmarFoco() {
            const valor = inputTemp.value.trim();
            if (valor) {
                if (valor.length > MAX_TAG_CHARS) {
                    alert(`O foco deve ter no máximo ${MAX_TAG_CHARS} caracteres.`);
                } else {
                    criarNovaTag(valor);
                }
            }
            inputTemp.remove();
            btnAddFoco.style.display = 'inline-block';
        }

        inputTemp.addEventListener('blur', confirmarFoco);
        inputTemp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputTemp.blur();
            }
        });
    });

    function criarNovaTag(texto) {
        const label = document.createElement('label');
        label.className = 'tag-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = texto;

        const span = document.createElement('span');
        span.textContent = texto;

        label.appendChild(checkbox);
        label.appendChild(span);

        focosContainer.insertBefore(label, btnAddFoco);
    }


    // --- 4. PREPARAÇÃO PARA ENVIO (SUBMIT) ---
    const form = document.getElementById('form-perfil');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Coleta de dados
        const dadosPerfil = {
            nome: document.getElementById('nome-exibicao').value,
            especialidade: document.getElementById('especialidade-input').value,
            anosExperiencia: document.getElementById('anos-experiencia').value,
            servicos: obterServicosDoDOM(),
            formacao: obterFormacaoDoDOM(),
            biografia: document.getElementById('biografia').value,

            endereco: document.getElementById('endereco').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            telefone: document.getElementById('telefone').value,
            horarioSemana: document.getElementById('horario-semana').value,
            horarioFimSemana: document.getElementById('horario-fim-semana').value,

            convenios: Array.from(document.querySelectorAll('#convenios-container input:checked')).map(cb => cb.value)
        };

        // Enviar foto se houver
        const fotoInput = document.getElementById('input-foto');
        const formData = new FormData();
        
        if (fotoInput.files[0]) {
            formData.append('foto', fotoInput.files[0]);
        }
        
        formData.append('dados', JSON.stringify(dadosPerfil));

        // Enviar para API
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        fetch('/api/profissional/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPerfil)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Perfil atualizado com sucesso!');
                // Opcional: recarregar página ou atualizar UI
            } else {
                alert('Erro: ' + (data.message || 'Erro ao salvar'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Salvar Alterações';
        });
    });

    function obterServicosDoDOM() {
        const cards = document.querySelectorAll('.service-card-edit:not(.formacao-card)');
        const lista = [];
        cards.forEach(card => {
            lista.push({
                nome: card.querySelector('strong').textContent,
                preco: card.querySelector('span').textContent
            });
        });
        return lista;
    }

    function obterFormacaoDoDOM() {
        const cards = document.querySelectorAll('.formacao-card');
        const lista = [];
        cards.forEach(card => {
            lista.push({
                curso: card.querySelector('strong').textContent,
                instituicao: card.querySelector('span').textContent
            });
        });
        return lista;
    }
});