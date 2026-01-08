// --- FUNÇÃO DE ABAS (Mantida Original) ---
function switchTab(tabId) {
    const navItems = document.querySelectorAll('.profile-tabs li');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        pane.classList.remove('active-pane');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

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
    modal.style.display = 'flex';

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
    document.getElementById('modalAvaliacao').style.display = 'none';
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

// Initialize star rating clicks
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => updateStarRating(index + 1));
    });

    // Character counter for comment
    const comentario = document.getElementById('comentario');
    const charCount = document.getElementById('charCount');

    if (comentario && charCount) {
        comentario.addEventListener('input', function() {
            charCount.textContent = `${this.value.length}/500 caracteres`;
        });
    }
});

// --- LÓGICA DE INTERFACE E MAPA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DROPDOWN (Mantido Original) ---
    document.addEventListener('click', (e) => {
        const target = e.target;
        const profileWrapper = target.closest('.profile-pic');
        if (profileWrapper) {
            const menu = profileWrapper.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.toggle('show');
                e.stopPropagation();
            }
            return;
        }
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        }
    });

    // --- LÓGICA DO MAPA (Corrigida) ---
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                // Detecta quando a aba de local fica ativa
                if (target.id === 'local' && target.classList.contains('active-pane')) {
                    setTimeout(() => {
                        initMap();
                    }, 200);
                }
            }
        });
    });

    const localTab = document.getElementById('local');
    if (localTab) {
        observer.observe(localTab, { attributes: true });
    } else {
        initMap();
    }
});

// Variável global para o mapa
let mapInstance = null;

function initMap() {
    const mapElement = document.getElementById('map');
    
    if (!mapElement) return;
    if (typeof L === 'undefined') {
        console.error("Leaflet (L) não encontrado. Verifique os imports no HTML.");
        return;
    }
    
    // Correção: Se o mapa já existe, recalcula o tamanho para não ficar cinza
    if (mapInstance) {
        mapInstance.invalidateSize();
        return;
    }

    const endereco = mapElement.getAttribute('data-endereco') || '';
    const bairro = mapElement.getAttribute('data-bairro') || '';
    const cidade = mapElement.getAttribute('data-cidade') || '';
    const estado = mapElement.getAttribute('data-estado') || '';

    const fullAddress = [endereco, bairro, cidade, estado, "Brasil"].filter(Boolean).join(', ');

    try {
        mapInstance = L.map('map').setView([-14.2350, -51.9253], 4); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        if (fullAddress.length > 10) {
            geocodeAddress(fullAddress);
        } else {
            showMapPlaceholder("Endereço não informado.");
        }
    } catch (e) {
        console.error("Erro mapa:", e);
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
                console.warn('Endereço não encontrado:', address);
                // Tentativa de fallback (buscar só bairro/cidade)
                if(address.includes(',')) {
                    const fallbackAddress = address.split(',').slice(1).join(',');
                    if(fallbackAddress.trim().length > 5) {
                         geocodeAddress(fallbackAddress.trim());
                         return;
                    }
                }
                showMapPlaceholder("Não foi possível localizar o endereço exato.");
            }
        })
        .catch(error => {
            console.error('Erro Geocoding:', error);
            showMapPlaceholder("Erro ao carregar mapa.");
        });
}

function showMapPlaceholder(msg) {
    const mapElement = document.getElementById('map');
    if (mapElement) {
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