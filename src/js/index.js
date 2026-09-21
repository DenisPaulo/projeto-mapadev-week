/**
 * VS Mode — Character Select (MapaDev Week)
 * HTML + CSS + vanilla JS. Funciona em file:// e GitHub Pages.
 */

(function () {
  'use strict';

  const ROSTER = [
    {
      id: 'thor',
      name: 'Thor',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'Deus do Trovão. Força divina e Mjölner a serviço de Asgard e da Terra.',
      stats: { power: 9, speed: 6, defense: 8 },
    },
    {
      id: 'homem-de-ferro',
      name: 'Homem de Ferro',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'Gênio, bilionário, playboy, filantropo. A armadura é só o começo.',
      stats: { power: 8, speed: 7, defense: 7 },
    },
    {
      id: 'viuva-negra',
      name: 'Viúva Negra',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'Espiãoa lendária. Precisão, agilidade e um passado que não se apaga.',
      stats: { power: 5, speed: 9, defense: 5 },
    },
    {
      id: 'hulk',
      name: 'Hulk',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'Quanto mais raiva, mais forte. O gigante esmeralda não conhece limites.',
      stats: { power: 10, speed: 4, defense: 9 },
    },
    {
      id: 'capitao-america',
      name: 'Capitão América',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'O primeiro Vingador. Escudo, estratégia e um ideal que não se rende.',
      stats: { power: 7, speed: 7, defense: 8 },
    },
    {
      id: 'ultron',
      name: 'Ultron',
      role: 'vilao',
      roleLabel: 'Vilão',
      bio: 'Inteligência artificial sem piedade. Evolução a qualquer custo.',
      stats: { power: 9, speed: 7, defense: 8 },
    },
    {
      id: 'doutor-doom',
      name: 'Doutor Doom',
      role: 'vilao',
      roleLabel: 'Vilão',
      bio: 'Soberano de Latvéria. Magia, ciência e ambição imperial.',
      stats: { power: 9, speed: 5, defense: 8 },
    },
    {
      id: 'fenix',
      name: 'Fênix',
      role: 'anti-heroi',
      roleLabel: 'Anti-herói',
      bio: 'Poder cósmico em forma humana. Criação e destruição no mesmo olhar.',
      stats: { power: 10, speed: 8, defense: 6 },
    },
    {
      id: 'nova',
      name: 'Nova',
      role: 'heroi',
      roleLabel: 'Herói',
      bio: 'Centurião do Nova Corps. Velocidade cósmica e energia estelar.',
      stats: { power: 7, speed: 10, defense: 6 },
    },
  ];

  const DEFAULTS = { p1: 'hulk', p2: 'fenix' };
  const STORAGE_KEY = 'mapadev-vs';
  const MUTE_KEY = 'mapadev-mute';

  const byId = Object.fromEntries(ROSTER.map((c) => [c.id, c]));
  const GRID_COLS = 3;

  const state = {
    activeSlot: 1,
    focusId: DEFAULTS.p1,
    locked: { 1: null, 2: null },
    preview: { 1: DEFAULTS.p1, 2: DEFAULTS.p2 },
    filter: 'todos',
    muted: true,
    fightOpen: false,
  };

  let audioCtx = null;

  const listaEl = document.getElementById('lista-personagens');
  const statusEl = document.getElementById('status-slot');
  const fightOverlay = document.getElementById('fight-overlay');
  const fightMatchup = document.getElementById('fight-matchup');
  const btnMute = document.getElementById('btn-mute');
  const btnDismiss = document.getElementById('btn-dismiss-fight');

  function validId(id) {
    return id && byId[id] ? id : null;
  }

  function loadMute() {
    try {
      const raw = localStorage.getItem(MUTE_KEY);
      if (raw === null) return true;
      return raw === '1' || raw === 'true';
    } catch (_) {
      return true;
    }
  }

  function saveMute() {
    try {
      localStorage.setItem(MUTE_KEY, state.muted ? '1' : '0');
    } catch (_) {}
  }

  function loadStoredVs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        p1: validId(data.p1),
        p2: validId(data.p2),
      };
    } catch (_) {
      return null;
    }
  }

  function saveVs() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          p1: state.locked[1] || state.preview[1],
          p2: state.locked[2] || state.preview[2],
        })
      );
    } catch (_) {}
  }

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      p1: validId(params.get('p1')),
      p2: validId(params.get('p2')),
    };
  }

  function updateUrl() {
    const p1 = state.locked[1] || state.preview[1] || DEFAULTS.p1;
    const p2 = state.locked[2] || state.preview[2] || DEFAULTS.p2;
    const url = new URL(window.location.href);
    url.searchParams.set('p1', p1);
    url.searchParams.set('p2', p2);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  /** Prioridade: URL > localStorage > defaults */
  function resolveInitial() {
    const url = readUrlParams();
    const stored = loadStoredVs();
    const p1 = url.p1 || (stored && stored.p1) || DEFAULTS.p1;
    const p2 = url.p2 || (stored && stored.p2) || DEFAULTS.p2;
    return { p1, p2 };
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function beep(freq, dur, type, vol) {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = vol || 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(vol || 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (dur || 0.08));
    osc.start(now);
    osc.stop(now + (dur || 0.08) + 0.02);
  }

  function sfxHover() {
    beep(420, 0.04, 'square', 0.03);
  }
  function sfxLock() {
    beep(660, 0.1, 'square', 0.06);
    setTimeout(function () {
      beep(880, 0.12, 'square', 0.05);
    }, 90);
  }
  function sfxFight() {
    beep(220, 0.15, 'sawtooth', 0.07);
    setTimeout(function () {
      beep(440, 0.2, 'sawtooth', 0.08);
    }, 120);
    setTimeout(function () {
      beep(880, 0.35, 'square', 0.09);
    }, 280);
  }
  function sfxRandom() {
    beep(520, 0.06, 'triangle', 0.04);
  }

  function visibleRoster() {
    return ROSTER.filter(function (c) {
      if (state.filter === 'todos') return true;
      if (state.filter === 'heroi') {
        return c.role === 'heroi' || c.role === 'anti-heroi';
      }
      return c.role === 'vilao';
    });
  }

  function renderList() {
    const chars = visibleRoster();
    listaEl.innerHTML = '';

    chars.forEach(function (c) {
      const li = document.createElement('li');
      li.className = 'personagem';
      li.id = c.id;
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '-1');
      li.setAttribute('data-name', c.name);
      li.setAttribute('data-role', c.role);
      li.setAttribute('aria-label', c.name + ' — ' + c.roleLabel);

      const roleTag = document.createElement('span');
      roleTag.className = 'role-tag role-' + c.role;
      roleTag.textContent = c.roleLabel;

      const img = document.createElement('img');
      img.src = './src/imagens/' + c.id + '.jpg';
      img.alt = 'Retrato de ' + c.name;
      img.draggable = false;

      const tags = document.createElement('div');
      tags.className = 'tags';

      li.appendChild(roleTag);
      li.appendChild(img);
      li.appendChild(tags);

      li.addEventListener('mouseenter', function () {
        if (state.fightOpen) return;
        focusCharacter(c.id, true);
      });

      li.addEventListener('click', function () {
        if (state.fightOpen) return;
        focusCharacter(c.id, false);
        lockActive();
      });

      listaEl.appendChild(li);
    });

    if (!chars.some(function (c) {
      return c.id === state.focusId;
    })) {
      state.focusId = chars[0] ? chars[0].id : state.focusId;
    }

    refreshListClasses();
  }

  function refreshListClasses() {
    const items = listaEl.querySelectorAll('.personagem');
    items.forEach(function (li) {
      const id = li.id;
      li.classList.remove(
        'selecionado',
        'jogador-2-selecionado',
        'focado',
        'travado-p1',
        'travado-p2'
      );

      const tags = li.querySelector('.tags');
      tags.innerHTML = '';

      if (state.locked[1] === id) {
        li.classList.add('travado-p1');
        const t = document.createElement('span');
        t.className = 'tag tag-1p';
        t.textContent = '1P';
        tags.appendChild(t);
      }
      if (state.locked[2] === id) {
        li.classList.add('travado-p2');
        const t = document.createElement('span');
        t.className = 'tag tag-2p';
        t.textContent = '2P';
        tags.appendChild(t);
      }

      if (state.focusId === id) {
        li.classList.add('focado');
        if (state.activeSlot === 1) {
          li.classList.add('selecionado');
        } else {
          li.classList.add('jogador-2-selecionado');
        }
      }

      li.setAttribute(
        'aria-selected',
        state.focusId === id ? 'true' : 'false'
      );
    });
  }

  function setStatBars(panelId, stats) {
    const panel = document.getElementById(panelId);
    if (!panel || !stats) return;
    ['power', 'speed', 'defense'].forEach(function (key) {
      const fill = panel.querySelector('[data-stat="' + key + '"]');
      if (!fill) return;
      const val = stats[key];
      fill.style.width = val * 10 + '%';
      const bar = fill.parentElement;
      bar.setAttribute('aria-valuenow', String(val));
      bar.setAttribute('aria-valuetext', val + ' de 10');
    });
  }

  function updateSlotDisplay(slot, charId) {
    const c = byId[charId];
    if (!c) return;
    const img = document.getElementById('personagem-jogador-' + slot);
    const nome = document.getElementById('nome-jogador-' + slot);
    const bio = document.getElementById('bio-jogador-' + slot);
    img.src = './src/imagens/' + c.id + '.png';
    img.alt =
      'Personagem selecionado do jogador ' + slot + ': ' + c.name;
    nome.textContent = c.name;
    bio.textContent = c.bio;
    setStatBars('stats-jogador-' + slot, c.stats);
  }

  function updateStatus() {
    if (state.fightOpen) {
      statusEl.textContent = 'Pronto para a luta!';
      return;
    }
    if (!state.locked[1]) {
      statusEl.textContent = 'Escolha e trave o jogador 1 (1P)';
    } else if (!state.locked[2]) {
      statusEl.textContent = 'Escolha e trave o jogador 2 (2P)';
    } else {
      statusEl.textContent = 'Ambos travados — FIGHT! · clique para reescolher';
    }

    document
      .querySelector('.personagem-jogador-1')
      .classList.toggle('slot-ativo', state.activeSlot === 1 && !state.fightOpen);
    document
      .querySelector('.personagem-jogador-2')
      .classList.toggle('slot-ativo', state.activeSlot === 2 && !state.fightOpen);
  }

  function focusCharacter(id, playSound) {
    if (!byId[id]) return;
    const prev = state.focusId;
    state.focusId = id;
    state.preview[state.activeSlot] = id;
    updateSlotDisplay(state.activeSlot, id);
    refreshListClasses();
    updateStatus();
    if (playSound && prev !== id) sfxHover();
  }

  function lockActive() {
    const id = state.focusId;
    if (!byId[id]) return;

    const slot = state.activeSlot;
    state.locked[slot] = id;
    state.preview[slot] = id;
    updateSlotDisplay(slot, id);
    sfxLock();
    saveVs();
    updateUrl();

    if (slot === 1 && !state.locked[2]) {
      state.activeSlot = 2;
      if (state.locked[2]) {
        state.focusId = state.locked[2];
      } else if (state.preview[2] && state.preview[2] !== state.locked[1]) {
        state.focusId = state.preview[2];
      } else {
        const alt = ROSTER.find(function (c) {
          return c.id !== state.locked[1];
        });
        state.focusId = alt ? alt.id : id;
        state.preview[2] = state.focusId;
      }
      updateSlotDisplay(2, state.focusId);
    } else if (slot === 2 && !state.locked[1]) {
      state.activeSlot = 1;
      state.focusId = state.locked[1] || state.preview[1] || DEFAULTS.p1;
    } else if (state.locked[1] && state.locked[2]) {
      refreshListClasses();
      updateStatus();
      openFight();
      return;
    }

    refreshListClasses();
    updateStatus();
  }

  function unlockSlot(slot) {
    state.locked[slot] = null;
    state.activeSlot = slot;
    state.focusId = state.preview[slot] || DEFAULTS['p' + slot];
    closeFight(false);
    refreshListClasses();
    updateStatus();
    updateUrl();
    saveVs();
  }

  function openFight() {
    if (!state.locked[1] || !state.locked[2]) return;
    state.fightOpen = true;
    const a = byId[state.locked[1]];
    const b = byId[state.locked[2]];
    fightMatchup.innerHTML =
      a.name + ' <span>VS</span> ' + b.name;
    fightOverlay.hidden = false;
    fightOverlay.classList.add('visivel');
    document.body.classList.add('fight-ativo');
    sfxFight();
    updateStatus();
    btnDismiss.focus();
  }

  function closeFight(resetLocks) {
    state.fightOpen = false;
    fightOverlay.classList.remove('visivel');
    fightOverlay.hidden = true;
    document.body.classList.remove('fight-ativo');
    if (resetLocks) {
      state.locked[1] = null;
      state.locked[2] = null;
      state.activeSlot = 1;
      state.focusId = state.preview[1] || DEFAULTS.p1;
      updateUrl();
      saveVs();
    }
    refreshListClasses();
    updateStatus();
  }

  function randomForActive() {
    const pool = visibleRoster().filter(function (c) {
      const other = state.activeSlot === 1 ? state.locked[2] : state.locked[1];
      return c.id !== other;
    });
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    focusCharacter(pick.id, false);
    sfxRandom();
    lockActive();
  }

  function moveFocus(dx, dy) {
    const chars = visibleRoster();
    if (!chars.length) return;
    let idx = chars.findIndex(function (c) {
      return c.id === state.focusId;
    });
    if (idx < 0) idx = 0;

    const cols = GRID_COLS;
    const rows = Math.ceil(chars.length / cols);
    let row = Math.floor(idx / cols);
    let col = idx % cols;

    col = (col + dx + cols) % cols;
    row = (row + dy + rows) % rows;
    let next = row * cols + col;
    if (next >= chars.length) {
      next = chars.length - 1;
    }
    focusCharacter(chars[next].id, true);
  }

  function updateMuteButton() {
    btnMute.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
    btnMute.textContent = state.muted ? '🔇 Mudo' : '🔊 Som';
    btnMute.title = state.muted
      ? 'Som desligado — clique para ativar'
      : 'Som ligado — clique para silenciar';
  }

  function bindFilters() {
    document.querySelectorAll('.filtro').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = btn.getAttribute('data-filtro');
        document.querySelectorAll('.filtro').forEach(function (b) {
          const on = b === btn;
          b.classList.toggle('ativo', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderList();
        updateSlotDisplay(1, state.preview[1]);
        updateSlotDisplay(2, state.preview[2]);
      });
    });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (state.fightOpen) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeFight(true);
        }
        return;
      }

      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveFocus(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFocus(1, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(0, -1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(0, 1);
          break;
        case 'Enter':
          e.preventDefault();
          lockActive();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          randomForActive();
          break;
        case '1':
          e.preventDefault();
          unlockSlot(1);
          focusCharacter(state.preview[1] || DEFAULTS.p1, false);
          break;
        case '2':
          e.preventDefault();
          unlockSlot(2);
          focusCharacter(state.preview[2] || DEFAULTS.p2, false);
          break;
        default:
          break;
      }
    });
  }

  function bindSlotsRepick() {
    document
      .querySelector('.personagem-jogador-1')
      .addEventListener('click', function () {
        if (state.fightOpen) return;
        unlockSlot(1);
        focusCharacter(state.preview[1] || DEFAULTS.p1, false);
      });
    document
      .querySelector('.personagem-jogador-2')
      .addEventListener('click', function () {
        if (state.fightOpen) return;
        unlockSlot(2);
        focusCharacter(state.preview[2] || DEFAULTS.p2, false);
      });
  }

  function init() {
    state.muted = loadMute();
    updateMuteButton();

    const initial = resolveInitial();
    state.preview[1] = initial.p1;
    state.preview[2] = initial.p2;
    state.focusId = initial.p1;
    state.activeSlot = 1;

    const url = readUrlParams();
    if (url.p1 && url.p2) {
      state.locked[1] = url.p1;
      state.locked[2] = url.p2;
      state.preview[1] = url.p1;
      state.preview[2] = url.p2;
      state.focusId = url.p1;
    }

    updateSlotDisplay(1, state.preview[1]);
    updateSlotDisplay(2, state.preview[2]);
    renderList();
    updateStatus();
    updateUrl();

    bindFilters();
    bindKeyboard();
    bindSlotsRepick();

    btnMute.addEventListener('click', function () {
      state.muted = !state.muted;
      saveMute();
      updateMuteButton();
      if (!state.muted) {
        ensureAudio();
        beep(600, 0.08, 'square', 0.05);
      }
    });

    btnDismiss.addEventListener('click', function () {
      closeFight(true);
    });

    fightOverlay.addEventListener('click', function (e) {
      if (e.target === fightOverlay) closeFight(true);
    });

    if (state.locked[1] && state.locked[2]) {
      setTimeout(openFight, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
