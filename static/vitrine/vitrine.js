document.addEventListener('DOMContentLoaded', () => {

    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    if (priceRange && priceValue) {

        // Função para pintar o fundo do slider (Turquesa atrás, Cinza na frente)
        function updateSliderColor(input) {
            const min = input.min;
            const max = input.max;
            const val = input.value;

            // Calcula a porcentagem atual (0% a 100%)
            const percentage = ((val - min) / (max - min)) * 100;

            // Atualiza o CSS: Turquesa até X%, Cinza dali pra frente
            // OBS: As cores devem bater com suas variáveis CSS
            // #003459 é o seu --turques
            // #d3d3d3 é o cinza padrão
            input.style.background = `linear-gradient(to right, #003459 ${percentage}%, #d3d3d3 ${percentage}%)`;
        }

        // Função para atualizar o texto e a cor
        function updateUI() {
            // Atualiza a cor
            updateSliderColor(priceRange);

            // Atualiza o Texto
            if (priceRange.value == priceRange.max) {
                // ALTERAÇÃO: Usa o max (999) dinamicamente
                priceValue.textContent = `R$ ${priceRange.max}+`;
            } else {
                priceValue.textContent = `Até R$ ${priceRange.value}`;
            }
        }

        // Evento: Quando arrastar
        priceRange.addEventListener('input', updateUI);

        // Inicializa (para já carregar com a cor certa)
        updateUI();
    }

    // Carregar cards dinamicamente
    let tipoAtual = 'profissional';
    
    function carregarCards(tipo) {
        tipoAtual = tipo;
        const container = document.getElementById('cards-container');
        const countEl = document.getElementById('results-count');
        
        container.innerHTML = '<p style="text-align: center; padding: 40px;">Carregando...</p>';
        
        fetch(`/api/vitrine?tipo=${tipo}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.resultados) {
                    container.innerHTML = '';
                    
                    if (data.resultados.length === 0) {
                        container.innerHTML = '<div style="min-height: 400px; display: flex; align-items: center; justify-content: center;"><p style="text-align: center; padding: 40px; color: #777; font-size: 1.1rem;">Nenhum resultado encontrado.</p></div>';
                        countEl.textContent = '0 resultados encontrados';
                        return;
                    }
                    
                    countEl.textContent = `${data.resultados.length} ${tipo === 'profissional' ? 'Profissionais' : 'Clínicas'} encontrados`;
                    
                    data.resultados.forEach(item => {
                        // Debug: verificar se o id está presente
                        if (!item.id) {
                            console.error('Item sem ID:', item);
                            return;
                        }
                        const card = criarCard(item);
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #ff4b4b;">Erro ao carregar resultados.</p>';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                container.innerHTML = '<p style="text-align: center; padding: 40px; color: #ff4b4b;">Erro ao conectar com o servidor.</p>';
            });
    }
    
    function criarCard(item) {
        const card = document.createElement('div');
        card.className = 'card-item';
        
        const fotoUrl = item.foto ? `static/uploads/${item.foto}` : null;
        const iconClass = item.tipo === 'profissional' ? 'fa-user-doctor' : 'fa-hospital';
        const badgeClass = item.tipo === 'profissional' ? 'badge-pro' : 'badge-clinic';
        const badgeText = item.tipo === 'profissional' ? 'Profissional' : 'Clínica';
        const linkUrl = item.tipo === 'profissional' 
            ? `/profissional/perfil/${item.id}` 
            : `/clinica/perfil/${item.id}`;
        const linkText = item.tipo === 'profissional' ? 'Ver Perfil' : 'Ver Clínica';
        
        const precoHtml = item.preco 
            ? `<div class="price-tag">
                <span>${item.tipo === 'profissional' ? 'Consulta' : 'A partir de'}</span>
                <strong>R$ ${item.preco.toFixed(2).replace('.', ',')}</strong>
               </div>`
            : '<div class="price-tag"><span>Consulte valores</span></div>';
        
        const conveniosHtml = item.convenios && item.convenios.length > 0
            ? `<div class="card-tags">
                ${item.convenios.slice(0, 3).map(c => `<span class="tag">${c}</span>`).join('')}
               </div>`
            : '';
        
        card.innerHTML = `
            <div class="card-logo ${item.tipo === 'clinica' ? 'logo-clinic' : ''}">
                ${fotoUrl 
                    ? `<img src="${fotoUrl}" alt="${item.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : `<i class="fa-solid ${iconClass}"></i>`
                }
            </div>
            <div class="card-info">
                <div class="card-header-info">
                    <h4>${item.nome}</h4>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                ${item.especialidade ? `<p class="specialty">${item.especialidade}</p>` : ''}
                <div class="card-bottom-info">
                    ${conveniosHtml}
                    <div class="location-info">
                        <i class="fa-solid fa-map-pin"></i> ${item.localizacao || 'Localização não informada'}
                    </div>
                </div>
            </div>
            <div class="card-action">
                ${precoHtml}
                <a href="${linkUrl}" class="btn-view">${linkText} <i class="fa-solid fa-arrow-right"></i></a>
                <span class="last-seen">Disponível</span>
            </div>
        `;
        
        return card;
    }
    
    // Carregar cards iniciais
    carregarCards('profissional');
    
    // Filtrar por tipo
    const typeRadios = document.querySelectorAll('input[name="type"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const tipo = e.target.id === 'type-pro' ? 'profissional' : 'clinica';
            carregarCards(tipo);
        });
    });

    // --- LÓGICA DOS SELECTS CUSTOMIZADOS ---

    const allCustomSelects = document.querySelectorAll('.custom-select-wrapper');

    allCustomSelects.forEach(wrapper => {
        const customSelect = wrapper.querySelector('.custom-select');
        const realSelect = wrapper.querySelector('select');
        const selectedSpan = customSelect.querySelector('.selected-option');
        const options = customSelect.querySelectorAll('.custom-options li');

        // Toggle (Abrir/Fechar)
        customSelect.addEventListener('click', (e) => {
            // Fecha outros selects abertos
            document.querySelectorAll('.custom-select').forEach(other => {
                if (other !== customSelect) other.classList.remove('open');
            });

            customSelect.classList.toggle('open');
            e.stopPropagation(); // Impede que o clique feche imediatamente
        });

        // Selecionar Opção
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                // Atualiza Texto Visual
                selectedSpan.textContent = option.textContent;
                selectedSpan.style.color = "#333"; // Cor de texto ativo

                // Atualiza Select Real (Oculto)
                const value = option.getAttribute('data-value');
                realSelect.value = value;

                // Fecha
                customSelect.classList.remove('open');

                // Opcional: Dispara evento de mudança para outros scripts ouvirem
                const event = new Event('change');
                realSelect.dispatchEvent(event);

                console.log("Selecionado:", value); // Para teste
            });
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(select => {
            select.classList.remove('open');
        });
    });
});

// Header dropdown já é gerenciado pelo header.js global, não precisa duplicar aqui