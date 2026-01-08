// landingPage.js — versão corrigida e resistente a erros
(function () {
  // --- Util helpers ---
  const safe = fn => {
    try { return fn(); } catch (err) { console.error(err); return null; }
  };

  // --- Busca (opcional) ---
  safe(() => {
    const input = document.getElementById('location');
    const btn = document.getElementById('btnBuscar');

    function buscar() {
      const value = (input?.value || '').trim();
      if (!value) {
        alert('Digite sua cidade ou CEP para buscar clínicas.');
        input?.focus();
        return;
      }
      alert(`Buscando clínicas próximas a: ${value}`);
    }

    if (btn) btn.addEventListener('click', buscar);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') buscar();
      });
    }
  });

  // Lógica de dropdown removida - agora gerenciada pelo header.js global

  // --- Smooth scroll seguro para âncoras internas ---
  safe(() => {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        // Ignora href apenas "#" (que é comum em menus / dropdowns)
        if (href === '#') {
          // optional: evitar navegação padrão que pode pular ao topo
          e.preventDefault();
          return;
        }
        // Se href for algo como "#id", só tentar encontrar quando houver mais que 1 caractere
        if (href.length > 1) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  });

})();