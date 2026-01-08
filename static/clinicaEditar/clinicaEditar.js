document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. CONFIGURAÇÃO DE LIMITES ---
    const limitesGerais = {
        'nome-clinica': 60,
        'tipo-clinica': 40,
        'ano-fundacao': 4,
        'diretor-tecnico': 50,
        'site-clinica': 50,
        'insta-clinica': 30,
        
        'membro-nome': 50,
        'membro-especialidade': 30,
        'membro-xp': 20,
        
        'service-name': 40,
        'service-price': 15,
        
        'endereco': 100,
        'bairro': 50,
        'cidade': 50,
        'telefone': 15,
        'horario-semana': 50,
        'horario-fim-semana': 50
    };

    for (const [id, max] of Object.entries(limitesGerais)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.setAttribute('maxlength', max);
        }
    }

    // --- 1. LÓGICA DE FOTO/LOGO ---
    const inputFoto = document.getElementById('input-foto');
    const previewContainer = document.getElementById('photo-preview');

    inputFoto.addEventListener('change', function(evento) {
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
            leitor.onload = function(e) {
                previewContainer.innerHTML = `<img src="${e.target.result}" alt="Logo da Clínica">`;
                
                // Enviar foto para o servidor
                const formData = new FormData();
                formData.append('foto', arquivo);
                
                fetch('/api/clinica/upload-foto', {
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

    // --- 2. LÓGICA DE EXAMES/PROCEDIMENTOS ---
    const serviceNameInput = document.getElementById('service-name');
    const servicePriceInput = document.getElementById('service-price');
    const addBtn = document.getElementById('add-service-btn');
    const listContainer = document.getElementById('services-container');
    const counter = document.getElementById('service-counter');
    
    let serviceCount = 0; 
    const MAX_SERVICES = 15; 
    const MAX_CHARS_NAME = limitesGerais['service-name'];
    const MAX_CHARS_PRICE = limitesGerais['service-price'];

    // Exemplos iniciais
    addServiceCard("Ultrassonografia Geral", "120,00");
    addServiceCard("Raio-X Digital", "80,00");

    addBtn.addEventListener('click', () => {
        const name = serviceNameInput.value.trim();
        const price = servicePriceInput.value.trim();

        if (!name || !price) {
            alert('Preencha o nome e o valor do procedimento.');
            return;
        }
        if (name.length > MAX_CHARS_NAME || price.length > MAX_CHARS_PRICE) {
            alert(`Texto muito longo!`);
            return;
        }
        if (serviceCount >= MAX_SERVICES) {
            alert('Limite de serviços atingido.');
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
                <button type="button" class="action-btn delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.querySelector('.delete').addEventListener('click', () => {
            if(confirm("Remover este procedimento?")) {
                card.remove();
                serviceCount--;
                updateCounter();
            }
        });

        listContainer.appendChild(card);
        serviceCount++;
        updateCounter();
    }

    function updateCounter() {
        counter.textContent = `${serviceCount}/${MAX_SERVICES} serviços criados`;
        if(serviceCount >= MAX_SERVICES) {
            addBtn.disabled = true;
            addBtn.textContent = 'Limite Atingido';
        } else {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar';
        }
    }

    // --- 3. LÓGICA DE CORPO CLÍNICO (Membros) ---
    const membroNome = document.getElementById('membro-nome');
    const membroEsp = document.getElementById('membro-especialidade');
    const membroXp = document.getElementById('membro-xp');
    const btnAddMembro = document.getElementById('btn-add-membro');
    const equipeContainer = document.getElementById('equipe-container');

    // Exemplos iniciais
    addTeamMemberCard("Dr. Carlos Eduardo", "Cardiologia", "15 anos");
    addTeamMemberCard("Dra. Ana Beatriz", "Dermatologia", "8 anos");

    btnAddMembro.addEventListener('click', () => {
        const nome = membroNome.value.trim();
        const esp = membroEsp.value.trim();
        const xp = membroXp.value.trim();

        if (!nome || !esp) {
            alert('Nome e Especialidade são obrigatórios.');
            return;
        }
        
        addTeamMemberCard(nome, esp, xp);
        
        membroNome.value = '';
        membroEsp.value = '';
        membroXp.value = '';
        membroNome.focus();
    });

    function addTeamMemberCard(nome, esp, xp) {
        const card = document.createElement('div');
        card.className = 'service-card-edit membro-card'; 
        
        const xpTag = xp ? `<span class="membro-xp-tag">${xp}</span>` : '';

        card.innerHTML = `
            <div class="service-details">
                <strong>${nome}</strong>
                <span class="membro-role">${esp}</span>
                ${xpTag}
            </div>
            <div class="service-actions">
                <button type="button" class="action-btn delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.querySelector('.delete').addEventListener('click', () => {
            if(confirm("Remover especialista?")) card.remove();
        });

        equipeContainer.appendChild(card);
    }


    // --- 4. LÓGICA DE INFRAESTRUTURA (Tags) ---
    const infraContainer = document.getElementById('infra-container');
    const btnAddInfra = document.getElementById('btn-add-infra');
    const MAX_TAG_CHARS = 25; 

    btnAddInfra.addEventListener('click', () => {
        const inputTemp = document.createElement('input');
        inputTemp.type = 'text';
        inputTemp.className = 'input-new-tag';
        inputTemp.placeholder = 'Digite e enter...';
        inputTemp.setAttribute('maxlength', MAX_TAG_CHARS);
        
        infraContainer.insertBefore(inputTemp, btnAddInfra);
        btnAddInfra.style.display = 'none';
        inputTemp.focus();

        function confirmarTag() {
            const valor = inputTemp.value.trim();
            if (valor) {
                criarNovaTag(valor, infraContainer, btnAddInfra);
            }
            inputTemp.remove();
            btnAddInfra.style.display = 'inline-block';
        }

        inputTemp.addEventListener('blur', confirmarTag);
        inputTemp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputTemp.blur();
            }
        });
    });

    function criarNovaTag(texto, container, botaoInsercao) {
        const label = document.createElement('label');
        label.className = 'tag-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = texto;

        const span = document.createElement('span');
        span.innerHTML = `<i class="fa-solid fa-check"></i> ${texto}`;

        label.appendChild(checkbox);
        label.appendChild(span);

        container.insertBefore(label, botaoInsercao);
    }

    // --- NOVO: LÓGICA DE GALERIA DE FOTOS COM LEGENDA ---
    const inputGaleria = document.getElementById('input-galeria');
    const galeriaContainer = document.getElementById('galeria-container');

    inputGaleria.addEventListener('change', function(evento) {
        const arquivos = Array.from(evento.target.files);
        
        arquivos.forEach(arquivo => {
            if (arquivo && arquivo.type.startsWith('image/')) {
                const leitor = new FileReader();
                leitor.onload = function(e) {
                    addGaleriaThumb(e.target.result);
                }
                leitor.readAsDataURL(arquivo);
            }
        });
    });

    function addGaleriaThumb(src) {
        const div = document.createElement('div');
        div.className = 'gallery-thumb';
        
        div.innerHTML = `
            <img src="${src}" alt="Foto da Clínica">
            <input type="text" class="gallery-caption-input" placeholder="Legenda..." maxlength="30">
            <button type="button" class="btn-remove-img" title="Remover"><i class="fa-solid fa-times"></i></button>
        `;

        div.querySelector('.btn-remove-img').addEventListener('click', () => {
            div.remove();
        });

        galeriaContainer.appendChild(div);
    }


    // --- 5. PREPARAÇÃO PARA ENVIO (SUBMIT) ---
    const form = document.getElementById('form-clinica');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dadosClinica = {
            nome: document.getElementById('nome-clinica').value,
            tipo: document.getElementById('tipo-clinica').value,
            fundacao: document.getElementById('ano-fundacao').value,
            diretor: document.getElementById('diretor-tecnico').value,
            site: document.getElementById('site-clinica').value,
            instagram: document.getElementById('insta-clinica').value,
            infraestrutura: Array.from(document.querySelectorAll('#infra-container input:checked')).map(cb => cb.value),
            equipe: obterEquipeDoDOM(),
            servicos: obterServicosDoDOM(),
            historia: document.getElementById('historia').value,
            endereco: document.getElementById('endereco').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            telefone: document.getElementById('telefone').value,
            horarioSemana: document.getElementById('horario-semana').value,
            horarioFimSemana: document.getElementById('horario-fim-semana').value,
            convenios: Array.from(document.querySelectorAll('#convenios-container input:checked')).map(cb => cb.value)
        };

        // Enviar para API
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        fetch('/api/clinica/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosClinica)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Perfil da clínica atualizado com sucesso!');
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
            submitBtn.textContent = 'Salvar Perfil da Clínica';
        });
    });

    function obterServicosDoDOM() {
        const cards = document.querySelectorAll('.service-card-edit:not(.membro-card)');
        const lista = [];
        cards.forEach(card => {
            lista.push({
                nome: card.querySelector('strong').textContent,
                preco: card.querySelector('span').textContent
            });
        });
        return lista;
    }

    function obterEquipeDoDOM() {
        const cards = document.querySelectorAll('.membro-card');
        const lista = [];
        cards.forEach(card => {
            lista.push({
                nome: card.querySelector('strong').textContent,
                especialidade: card.querySelector('.membro-role').textContent,
                xp: card.querySelector('.membro-xp-tag') ? card.querySelector('.membro-xp-tag').textContent : ''
            });
        });
        return lista;
    }

    // --- LÓGICA DE DROPDOWN (se já existir foto de perfil) ---
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 1. CLIQUE NA FOTO -> Abre/Fecha Menu
        const profileWrapper = target.closest('.profile-pic');
        if (profileWrapper) {
            const menu = profileWrapper.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.toggle('show');
                e.stopPropagation();
            }
            return;
        }

        // 2. CLIQUE FORA -> Fecha qualquer menu aberto
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        }
    });

});