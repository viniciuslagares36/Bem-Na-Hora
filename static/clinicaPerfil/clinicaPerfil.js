// --- FUNÇÃO DE ABAS (Mantida Original) ---
function switchTab(tabId) {
    // 1. Remove a classe 'active' de todas as abas
    const navItems = document.querySelectorAll('.profile-tabs li');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // 2. Esconde todo o conteúdo
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        pane.classList.remove('active-pane');
    });

    // 3. Adiciona 'active' na aba clicada
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // 4. Mostra o conteúdo correspondente
    const activePane = document.getElementById(tabId);
    if (activePane) {
        activePane.classList.add('active-pane');
    }
}

// --- FUNÇÕES DE AVALIAÇÃO ---
let currentOffset = 3; // Já temos 3 avaliações iniciais

function verMaisAvaliacoes(tipo, idEntidade) {
    event.preventDefault(); // Prevent default link behavior

    fetch(`/api/avaliacoes/${tipo}/${idEntidade}?offset=${currentOffset}&limit=6`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const reviewsGrid = document.querySelector('.reviews-grid');
                const verMaisContainer = document.querySelector('.ver-mais-container');

                data.avaliacoes.forEach(avaliacao => {
                    const reviewCard = document.createElement('div');
                    reviewCard.className = 'review-card';
                    reviewCard.innerHTML = `
                        <div class="review-header">
                            <div class="reviewer-avatar">${avaliacao.nome_usuario[0].toUpperCase()}</div>
                            <div class="reviewer-data">
                                <strong>${avaliacao.nome_usuario}</strong>
                                <div class="small-stars">
                                    ${Array.from({length: 5}, (_, i) =>
                                        i < avaliacao.nota ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'
                                    ).join('')}
                                </div>
                            </div>
                            <span class="review-date">${new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p class="review-text">"${avaliacao.comentario}"</p>
                    `;
                    reviewsGrid.appendChild(reviewCard);
                });

                currentOffset += data.avaliacoes.length;

                // Se retornou menos de 6, significa que não há mais avaliações
                if (data.avaliacoes.length < 6) {
                    verMaisContainer.style.display = 'none';
                }
            } else {
                alert('Erro ao carregar mais avaliações');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao carregar mais avaliações');
        });
}

function abrirModalAvaliacao(tipo, idEntidade) {
    const modal = document.getElementById('modalAvaliacao');
    const modalTipo = document.getElementById('modalTipo');
    const form = document.getElementById('formAvaliacao');

    modalTipo.textContent = tipo === 'clinica' ? 'Clínica' : 'Profissional';
    modal.classList.add('show');

    // Reset form
    form.reset();
    document.getElementById('ratingValue').value = '0';
    updateStarRating(0);

    // Set form action
    form.onsubmit = function(e) {
        e.preventDefault();
        enviarAvaliacao(tipo, idEntidade);
    };
}

function fecharModalAvaliacao() {
    document.getElementById('modalAvaliacao').classList.remove('show');
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fa-solid fa-star';
        } else {
            star.className = 'fa-regular fa-star';
        }
    });
    document.getElementById('ratingValue').value = rating;
}

function enviarAvaliacao(tipo, idEntidade) {
    const nota = document.getElementById('ratingValue').value;
    const comentario = document.getElementById('comentario').value;

    if (nota == '0') {
        alert('Por favor, selecione uma nota');
        return;
    }

    fetch('/api/avaliacao/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tipo: tipo,
            id_entidade: idEntidade,
            nota: parseInt(nota),
            comentario: comentario
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fecharModalAvaliacao();
            // Recarregar a página para atualizar as avaliações
            location.reload();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao enviar avaliação');
    });
}

// --- LÓGICA DE INTERFACE E MAPA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DROPDOWN (Mantido Original) ---
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
            fecharModalAvaliacao();
        }
    });

    // Lógica das estrelas
    document.getElementById('starRating').addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            document.getElementById('ratingValue').value = rating;

            const stars = document.querySelectorAll('#starRating i');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.className = 'fa-solid fa-star';
                } else {
                    star.className = 'fa-regular fa-star';
                }
            });
        }
    });

    // Contador de caracteres
    document.getElementById('comentario').addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('charCount').textContent = `${count}/500 caracteres`;
    });

    // Submissão do formulário
    document.getElementById('formAvaliacao').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nota = document.getElementById('ratingValue').value;
        const comentario = document.getElementById('comentario').value.trim();

        if (nota === '0') {
            alert('Por favor, selecione uma avaliação em estrelas.');
            return;
        }

        const btnSubmit = document.getElementById('btnSubmitAvaliacao');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';

        try {
            const response = await fetch('/api/avaliacao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipoAvaliacaoAtual,
                    id: idAvaliacaoAtual,
                    nota: parseInt(nota),
                    comentario: comentario
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Avaliação enviada com sucesso!');
                fecharModalAvaliacao();
                // Recarregar a página para atualizar as avaliações
                window.location.reload();
            } else {
                alert(result.message || 'Erro ao enviar avaliação.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Tente novamente.');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar Avaliação';
        }
    });

    // Fechar modal ao clicar fora
    document.getElementById('modalAvaliacao').addEventListener('click', (e) => {
        if (e.target.id === 'modalAvaliacao') {
            fecharModalAvaliacao();
        }
    });

    // --- LÓGICA DO MAPA (Corrigida) ---
    
    // Observer para detectar quando a aba 'local' é aberta
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'local' && target.classList.contains('active-pane')) {
                    // Delay para garantir que a div está visível antes de desenhar o mapa
                    setTimeout(() => {
                        initMap();
                    }, 200);
                }
            }
            
            // --- FUNÇÕES DE AVALIAÇÃO ---
            function abrirModalAvaliacao(tipo, id) {
                tipoAvaliacaoAtual = tipo;
                idAvaliacaoAtual = id;
            
                document.getElementById('modalTipo').textContent = tipo === 'clinica' ? 'Clínica' : 'Profissional';
                document.getElementById('modalAvaliacao').style.display = 'flex';
            
                // Resetar formulário
                document.getElementById('ratingValue').value = '0';
                document.getElementById('comentario').value = '';
                document.getElementById('charCount').textContent = '0/500 caracteres';
            
                const stars = document.querySelectorAll('#starRating i');
                stars.forEach(star => star.className = 'fa-regular fa-star');
            }
            
            function fecharModalAvaliacao() {
                document.getElementById('modalAvaliacao').style.display = 'none';
                tipoAvaliacaoAtual = null;
                idAvaliacaoAtual = null;
            }
            
            function verMaisAvaliacoes(tipo, id) {
                // Por enquanto, apenas um placeholder - pode ser implementado para carregar mais avaliações
                alert('Funcionalidade "Ver mais avaliações" será implementada em breve!');
            }
        });
    });

    const localTab = document.getElementById('local');
    if (localTab) {
        observer.observe(localTab, { attributes: true });
    } else {
        // Se não tiver abas ou a aba já estiver visível, tenta iniciar direto
        initMap();
    }
});

// Variável global para o mapa
let mapInstance = null;

// Variáveis para avaliação
let tipoAvaliacaoAtual = null;
let idAvaliacaoAtual = null;

function initMap() {
    const mapElement = document.getElementById('map');
    
    // Verificações de segurança
    if (!mapElement) return;
    if (typeof L === 'undefined') {
        console.error("Leaflet (L) não foi carregado. Adicione os scripts no HTML.");
        return;
    }
    
    // Se o mapa já existe, apenas atualiza o tamanho (correção para abas)
    if (mapInstance) {
        mapInstance.invalidateSize();
        return;
    }

    // Coletar dados
    const endereco = mapElement.getAttribute('data-endereco') || '';
    const bairro = mapElement.getAttribute('data-bairro') || '';
    const cidade = mapElement.getAttribute('data-cidade') || '';
    const estado = mapElement.getAttribute('data-estado') || '';

    // Monta string de busca
    const fullAddress = [endereco, bairro, cidade, estado, "Brasil"].filter(Boolean).join(', ');

    // Inicializa o mapa
    try {
        mapInstance = L.map('map').setView([-14.2350, -51.9253], 4); // Centro do Brasil inicial

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        if (fullAddress.length > 10) { // Validação simples se tem endereço
            geocodeAddress(fullAddress);
        } else {
            showMapPlaceholder("Endereço não informado.");
        }
    } catch (e) {
        console.error("Erro ao iniciar mapa:", e);
    }
}

function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    fetch(url, { headers: { 'User-Agent': 'BemNaHoraApp/1.0' } })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                mapInstance.setView([lat, lon], 16);

                L.marker([lat, lon]).addTo(mapInstance)
                    .bindPopup(`<b>Endereço:</b><br>${address}`)
                    .openPopup();
            } else {
                console.warn('Endereço não encontrado nas coordenadas:', address);
                // Tenta buscar apenas pela cidade se falhar
                if(address.includes(',')) {
                    // Pega o que está depois da primeira vírgula (geralmente Bairro/Cidade)
                    const fallbackAddress = address.split(',').slice(1).join(',');
                    if(fallbackAddress.trim().length > 5) {
                         geocodeAddress(fallbackAddress.trim());
                         return;
                    }
                }
                showMapPlaceholder("Endereço exato não localizado no mapa.");
            }
        })
        .catch(error => {
            console.error('Erro no geocoding:', error);
            showMapPlaceholder("Erro de conexão com o mapa.");
        });
}

function showMapPlaceholder(msg) {
    const mapElement = document.getElementById('map');
    // Só substitui se o mapa não foi desenhado corretamente ou se quisermos forçar erro
    if (mapElement) {
        // Se existir instância de mapa, removemos para limpar a visualização cinza
        if(mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }

        const endereco = mapElement.getAttribute('data-endereco') || '';
        const cidade = mapElement.getAttribute('data-cidade') || '';
        const linkGoogle = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco + ' ' + cidade)}`;

        mapElement.innerHTML = `
            <div class="map-placeholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px; background:#f9f9f9;">
                <i class="fa-solid fa-map-location-dot" style="font-size:40px; color:#ccc; margin-bottom:10px;"></i>
                <p style="color:#666; margin-bottom:15px;">${msg}</p>
                <a href="${linkGoogle}" target="_blank" class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;">
                   <i class="fa-solid fa-external-link-alt"></i> Abrir no Google Maps
                </a>
            </div>
        `;
    }
}