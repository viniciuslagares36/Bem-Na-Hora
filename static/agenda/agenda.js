document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO INICIAL ---
    let dataAtual = new Date(2025, 11, 5); // 05/Dez/2025
    let dataMini = new Date(dataAtual);
    let modoVisualizacao = 'dia';

    // --- ELEMENTOS DO DOM ---
    const displayData = document.getElementById('display-data');
    const btnAnterior = document.getElementById('btn-prev-day');
    const btnProximo = document.getElementById('btn-next-day');
    const btnHoje = document.getElementById('btn-today');
    const btnModeDia = document.getElementById('mode-dia');
    const btnModeSemana = document.getElementById('mode-semana');

    const timelineBody = document.getElementById('timeline-body');
    const headerEvents = document.getElementById('header-events');
    const checkboxes = document.querySelectorAll('.doc-filter');
    const checkAll = document.getElementById('filter-all');

    // Mini Calendário
    const miniGrid = document.querySelector('.mini-calendar-grid');
    const miniMonth = document.querySelector('.current-month');
    const miniPrev = document.getElementById('mini-prev');
    const miniNext = document.getElementById('mini-next');

    // --- DADOS (MOCK) ---
    const consultas = [
        { id: 1, dia: 5, hora: '08:00', paciente: 'Mariana Souza', proc: 'Consulta', doc: 'Dr. Carlos', tipo: 'doc1' },
        { id: 2, dia: 5, hora: '08:00', paciente: 'Pedro Silva', proc: 'Retorno', doc: 'Dra. Ana', tipo: 'doc2' },
        { id: 3, dia: 5, hora: '08:00', paciente: 'João Kleber', proc: 'Avaliação', doc: 'Dr. Roberto', tipo: 'doc3' },
        { id: 4, dia: 5, hora: '09:00', paciente: 'Lucas Mendes', proc: 'ECG', doc: 'Dr. Carlos', tipo: 'doc1' },
        { id: 5, dia: 5, hora: '10:00', paciente: 'Fernanda Lima', proc: 'Estética', doc: 'Dra. Ana', tipo: 'doc2' },
        { id: 6, dia: 1, hora: '08:00', paciente: 'Ana Paula', proc: 'Consulta', doc: 'Dr. Carlos', tipo: 'doc1' },
        { id: 7, dia: 2, hora: '09:00', paciente: 'Bruno Lima', proc: 'Ortopedia', doc: 'Dr. Roberto', tipo: 'doc3' },
    ];

    // --- NAVEGAÇÃO E HEADER ---
    function atualizarHeader() {
        const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };

        // Data de hoje real (zerada para comparação justa)
        const hojeReal = new Date();
        hojeReal.setHours(0, 0, 0, 0);

        const dataTela = new Date(dataAtual);
        dataTela.setHours(0, 0, 0, 0);

        if (modoVisualizacao === 'dia') {
            let texto = dataAtual.toLocaleDateString('pt-BR', opcoes);
            displayData.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);

            // Exibe badge APENAS se for o dia de hoje
            if (dataTela.getTime() === hojeReal.getTime()) {
                btnHoje.style.display = 'inline-block';
            } else {
                btnHoje.style.display = 'none';
            }

        } else {
            const inicio = new Date(dataAtual);
            inicio.setDate(dataAtual.getDate() - dataAtual.getDay());
            const fim = new Date(inicio);
            fim.setDate(inicio.getDate() + 6);

            const fmt = d => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
            displayData.textContent = `${fmt(inicio)} - ${fmt(fim)}`;

            // Na semana, exibe badge se "hoje" estiver dentro do intervalo
            const inicioZerado = new Date(inicio); inicioZerado.setHours(0, 0, 0, 0);
            const fimZerado = new Date(fim); fimZerado.setHours(0, 0, 0, 0);

            if (hojeReal >= inicioZerado && hojeReal <= fimZerado) {
                btnHoje.style.display = 'inline-block';
            } else {
                btnHoje.style.display = 'none';
            }
        }
    }

    // --- TIMELINE ---
    function renderizarTimeline() {
        timelineBody.innerHTML = '';
        const headerRow = document.querySelector('.timeline-header');

        if (modoVisualizacao === 'dia') {
            headerRow.classList.remove('week-mode');
            headerEvents.innerHTML = 'Agenda do Dia';

            for (let h = 7; h <= 19; h++) {
                const hour = h.toString().padStart(2, '0') + ':00';
                const row = document.createElement('div');
                row.className = 'time-slot';
                row.innerHTML = `<div class="slot-time">${hour}</div><div class="slot-events" id="slot-${h}"></div>`;
                timelineBody.appendChild(row);
            }
            preencherConsultasDia();

        } else {
            headerRow.classList.add('week-mode');
            headerEvents.innerHTML = '';

            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const inicioSemana = new Date(dataAtual);
            inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());

            for (let i = 0; i < 7; i++) {
                const d = new Date(inicioSemana);
                d.setDate(inicioSemana.getDate() + i);

                const div = document.createElement('div');
                div.className = 'day-header-cell';
                if (d.getDate() === new Date().getDate()) div.classList.add('today');

                div.textContent = `${diasSemana[i]} ${d.getDate()}`;
                headerEvents.appendChild(div);
            }

            for (let h = 7; h <= 19; h++) {
                const hour = h.toString().padStart(2, '0') + ':00';
                const row = document.createElement('div');
                row.className = 'time-slot week-mode';

                let cells = '';
                for (let col = 0; col < 7; col++) {
                    cells += `<div class="day-cell" id="slot-${col}-${h}"></div>`;
                }

                row.innerHTML = `<div class="slot-time">${hour}</div><div class="slot-events">${cells}</div>`;
                timelineBody.appendChild(row);
            }
            preencherConsultasSemana();
        }
    }

    function preencherConsultasDia() {
        const ativos = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);

        const doDia = consultas.filter(c => {
            const diaCorreto = c.dia === dataAtual.getDate();
            const medicoCorreto = (checkAll.checked || ativos.includes(c.doc));
            return diaCorreto && medicoCorreto;
        });

        doDia.forEach(c => {
            const h = parseInt(c.hora.split(':')[0]);
            const slot = document.getElementById(`slot-${h}`);

            if (slot) {
                if (slot.querySelectorAll('.appointment-card').length < 2) {
                    criarCard(c, slot, false);
                } else {
                    adicionarBotaoVerMais(slot, c, false);
                }
            }
        });
    }

    function preencherConsultasSemana() {
        const ativos = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
        const inicioSemana = new Date(dataAtual);
        inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        consultas.forEach(c => {
            if (!checkAll.checked && !ativos.includes(c.doc)) return;

            const dataC = new Date(2025, 11, c.dia);
            if (dataC >= inicioSemana && dataC <= fimSemana) {
                const diaSemana = dataC.getDay();
                const h = parseInt(c.hora.split(':')[0]);
                const slot = document.getElementById(`slot-${diaSemana}-${h}`);

                if (slot) {
                    if (slot.querySelectorAll('.appointment-card').length < 2) {
                        criarCard(c, slot, true);
                    } else {
                        adicionarBotaoVerMais(slot, c, true);
                    }
                }
            }
        });
    }

    function adicionarBotaoVerMais(slot, consulta, isCompact) {
        if (!slot.querySelector('.btn-show-more')) {
            const btn = document.createElement('button');
            btn.className = 'btn-show-more';
            btn.textContent = '+ Ver mais';
            btn.onclick = (e) => {
                e.stopPropagation();
                slot.classList.toggle('expanded');
                btn.textContent = slot.classList.contains('expanded') ? '- Menos' : '+ Ver mais';
            };
            slot.appendChild(btn);
        }
        criarCard(consulta, slot, isCompact, slot.querySelector('.btn-show-more'));
    }

    function criarCard(c, container, compact, insertBeforeElement = null) {
        const div = document.createElement('div');
        div.className = `appointment-card app-card-${c.tipo} ${compact ? 'compact' : ''}`;

        if (compact) {
            div.innerHTML = `<div class="card-top"><span class="app-time">${c.hora}</span></div><div class="app-patient">${c.paciente}</div>`;
        } else {
            div.innerHTML = `
                <div class="card-top">
                    <span class="app-time">${c.hora}</span>
                    <span class="app-doctor">${c.doc}</span>
                </div>
                <div class="app-patient">${c.paciente}</div>
                <div class="app-details">${c.proc}</div>
            `;
        }

        if (insertBeforeElement) {
            container.insertBefore(div, insertBeforeElement);
        } else {
            container.appendChild(div);
        }
    }

    // --- MINI CALENDÁRIO ---
    function renderMini() {
        miniGrid.innerHTML = '';
        ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(d => {
            const el = document.createElement('div');
            el.className = 'weekday'; el.textContent = d; miniGrid.appendChild(el);
        });

        const ano = dataMini.getFullYear(), mes = dataMini.getMonth();
        miniMonth.textContent = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const firstDay = new Date(ano, mes, 1).getDay();
        const daysInMonth = new Date(ano, mes + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const el = document.createElement('div');
            el.className = 'day prev-month'; el.textContent = '';
            miniGrid.appendChild(el);
        }

        const inicioSem = new Date(dataAtual);
        inicioSem.setDate(dataAtual.getDate() - dataAtual.getDay());
        const fimSem = new Date(inicioSem);
        fimSem.setDate(inicioSem.getDate() + 6);

        for (let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div');
            el.className = 'day';
            el.textContent = i;

            const thisDate = new Date(ano, mes, i);

            if (modoVisualizacao === 'dia') {
                if (i === dataAtual.getDate() && mes === dataAtual.getMonth()) el.classList.add('active');
            } else {
                if (thisDate >= inicioSem && thisDate <= fimSem) {
                    el.classList.add('week-range');
                    if (thisDate.getTime() === inicioSem.getTime()) el.classList.add('week-start');
                    if (thisDate.getTime() === fimSem.getTime()) el.classList.add('week-end');
                }
            }

            el.onclick = () => {
                dataAtual = new Date(ano, mes, i);
                renderAll();
            };
            miniGrid.appendChild(el);
        }
    }

    // --- EVENTOS ---
    function mudarDia(delta) {
        const dias = modoVisualizacao === 'dia' ? 1 : 7;
        dataAtual.setDate(dataAtual.getDate() + (delta * dias));
        renderAll();
    }

    btnAnterior.onclick = () => mudarDia(-1);
    btnProximo.onclick = () => mudarDia(1);

    btnHoje.onclick = () => {
        dataAtual = new Date(); // Data real
        dataMini = new Date(dataAtual);
        renderAll();
    };

    btnModeDia.onclick = () => {
        modoVisualizacao = 'dia';
        btnModeDia.classList.add('active');
        btnModeSemana.classList.remove('active');
        renderAll();
    };

    btnModeSemana.onclick = () => {
        modoVisualizacao = 'semana';
        btnModeSemana.classList.add('active');
        btnModeDia.classList.remove('active');
        renderAll();
    };

    miniPrev.onclick = () => { dataMini.setMonth(dataMini.getMonth() - 1); renderMini(); };
    miniNext.onclick = () => { dataMini.setMonth(dataMini.getMonth() + 1); renderMini(); };

    checkboxes.forEach(c => {
        c.addEventListener('change', () => {
            if (!c.checked) {
                checkAll.checked = false;
            } else {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                if (allChecked) checkAll.checked = true;
            }
            renderAll();
        });
    });

    checkAll.onchange = (e) => {
        checkboxes.forEach(c => c.checked = e.target.checked);
        renderAll();
    };

    function renderAll() {
        atualizarHeader();
        renderizarTimeline();
        renderMini();
    }

    renderAll();

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