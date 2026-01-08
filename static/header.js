// header.js - Funções globais do header (dropdown e logout)

// Função de logout
function logout() {
    fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/';
        } else {
            console.error('Erro ao fazer logout:', data.message);
        }
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
    });
}

// Lógica do dropdown do perfil
document.addEventListener('DOMContentLoaded', () => {
    // Handler para cliques no documento
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Se clicou na foto de perfil ou dentro dela, abre/fecha o menu
        const profileWrapper = target.closest('.profile-pic');
        if (profileWrapper) {
            const menu = profileWrapper.querySelector('.dropdown-menu');
            if (menu) {
                // Fecha outros menus abertos
                document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                menu.classList.toggle('show');
                e.stopPropagation();
            }
            return;
        }
        
        // Se clicou em um item do dropdown, não fecha o menu ainda
        if (target.closest('.dropdown-menu')) {
            return;
        }
        
        // Se clicou fora, fecha todos os menus
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

