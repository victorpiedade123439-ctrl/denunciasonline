
/* script.js — funcionalidade: registro local, renderização, menu responsivo */
(function(){
  'use strict';

  // Helpers
  const $ = sel => document.querySelector(sel);
  const qs = sel => document.querySelectorAll(sel);

  // Elements
  const form = $('#denunciaForm');
  const tipo = $('#tipo');
  const localSel = $('#local');
  const titulo = $('#titulo');
  const descricao = $('#descricao');
  const anonimo = $('#anonimo');
  const nome = $('#nome');
  const feedback = $('#denunciaFeedback');
  const listEl = $('#denunciasList');
  const totalCount = $('#totalCount');
  const yearEl = $('#year');
  const menuToggle = $('#menuToggle');
  const nav = $('#nav');

  const STORAGE_KEY = 'denuncias_gov_site_v1';

  // Initialize
  function init(){
    yearEl.textContent = new Date().getFullYear();
    bindEvents();
    renderList();
    updateCount();
  }

  // Bind UI events
  function bindEvents(){
    form.addEventListener('submit', onSubmit);
    form.addEventListener('reset', () => {
      feedback.textContent = '';
    });
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
  }

  // Load from localStorage
  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return [];
      return JSON.parse(raw);
    }catch(e){
      console.error('Erro ao ler armazenamento', e);
      return [];
    }
  }

  // Save to localStorage
  function save(arr){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }catch(e){
      console.error('Erro ao salvar', e);
    }
  }

  // Create protocol code (simple)
  function protocoloId(){
    const now = Date.now().toString(36);
    const rand = Math.floor(Math.random()*9000 + 1000).toString(36);
    return `P-${now}-${rand}`.toUpperCase();
  }

  // Form submit
  function onSubmit(e){
    e.preventDefault();
    // Basic validation
    if(!tipo.value || !localSel.value || !titulo.value.trim()){
      feedback.textContent = 'Preencha os campos: Tipo, Local e Título.';
      feedback.style.color = '#a94442';
      return;
    }

    const item = {
      id: protocoloId(),
      tipo: tipo.value,
      local: localSel.value,
      titulo: titulo.value.trim(),
      descricao: descricao.value.trim(),
      anonimo: anonimo.value === 'true',
      nome: nome.value.trim(),
      status: 'Em análise',
      criadoEm: new Date().toISOString()
    };

    const arr = load();
    arr.unshift(item); // mais recentes primeiro
    save(arr);
    renderList();
    updateCount();
    feedback.textContent = `Denúncia registrada — protocolo: ${item.id}`;
    feedback.style.color = '#0b3b66';
    form.reset();
  }

  // Render list
  function renderList(){
    const arr = load();
    listEl.innerHTML = '';
    if(arr.length === 0){
      listEl.innerHTML = '<p class="muted">Nenhuma denúncia registrada ainda. Assim que forem feitas, aparecerão aqui.</p>';
      return;
    }

    arr.forEach(d => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="denuncia-title">${escapeHtml(d.titulo)}</div>
        <div class="denuncia-meta small">${d.tipo} • ${d.local} • <strong>${d.status}</strong> • Protocolo: <code>${d.id}</code></div>
        <div class="denuncia-desc">${escapeHtml(d.descricao || '(sem descrição)')}</div>
        <div class="denuncia-meta small" style="margin-top:8px;">Reportado por: ${d.anonimo ? '<em>Anônimo</em>' : (d.nome || '<em>Nome não informado</em>')} — ${formatDate(d.criadoEm)}</div>
      `;
      listEl.appendChild(card);
    });
  }

  // Update counter
  function updateCount(){
    const arr = load();
    totalCount.textContent = arr.length;
  }

  // Utilities
  function formatDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleString();
    }catch(e){
      return iso;
    }
  }

  // Basic html escape
  function escapeHtml(s){
    if(!s) return '';
    return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // Start
  init();

})();
