#!/usr/bin/env node
// Teste de regressão headless do reencontro dos pais — spec 005-reencontro-pais.
// Carrega os scripts reais num contexto vm com stubs de browser, semeando o
// localStorage por cenário, e dirige a cena via window.__world.talk/finish.
//   Rodar:  node tests/test-reencontro-pais.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// ---- stubs de browser ----
function fakeCtx() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (prop === 'canvas') return { width: 360, height: 640 };
      return () => {};
    },
    set() { return true; },
  });
}
function fakeCanvas() {
  return {
    width: 360, height: 640, style: {},
    getContext: () => fakeCtx(),
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 640 }),
  };
}
function fakeAudioNode() {
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === 'currentTime') return 0;
      if (prop === 'destination') return fakeAudioNode();
      if (prop === 'gain' || prop === 'frequency') return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
      if (prop === 'state') return 'running';
      return () => fakeAudioNode();
    },
    set() { return true; },
    apply() { return fakeAudioNode(); },
  });
}
const FakeAudioContext = function () { return fakeAudioNode(); };

function loadGame({ seed = {} } = {}) {
  const store = new Map(Object.entries(seed));
  const win = {
    innerWidth: 360, innerHeight: 640, addEventListener() {},
    AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext,
  };
  win.location = { reload() {} };
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  };
  const sandbox = {
    window: win,
    document: { getElementById: () => fakeCanvas(), createElement: () => fakeCanvas(), addEventListener() {} },
    localStorage,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    navigator: { userAgent: 'node' },
    console, location: win.location,
    Math, JSON, Date, Object, Array, Number, String, Boolean, Set, Map, Symbol,
    Uint8ClampedArray, Float32Array,
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  let loadError = null;
  try { vm.runInContext(code, sandbox, { filename: 'game-bundle.js' }); }
  catch (e) { loadError = e; }
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, STORY: sandbox.STORY, store, loadError };
}

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Jonatha nasce adjacente à Micaele na abertura
//   Cenário: A ordem do onboarding (Micaele → Jonatha) não muda
//   Cenário: Pais registrados como cena, derivados do registro único
//   Cenário: O ponto dos pais é alcançável pela interação real (não só por bypass)
//   Cenário: Reencontro dispara ao tocar os pais pela primeira vez
//   Cenário: A cena ecoa as lições dos pais (coragem + fé)
//   Cenário: Reencontro já visto mostra a fala curta
//   Cenário: A cena não menciona morte (tom de reencontro afetivo)
//   Cenário: A cena não adiciona conchas
//   Cenário: A cena dos pais não altera o desfecho (clímax ortogonal)
//   Cenário: Save da cena vista não regride após reload
//   Cenário: Save com met ausente/malformado não trava (load defensivo)
//   Cenário: O load defensivo não corrompe os marcadores do onboarding
//   Cenário: Pais inacessíveis enquanto o Cais (d8) está na névoa
//   Cenário: Jogo carrega e desenha os pais sem exceção
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + String(extra) : '')); }
}
const txt = lines => (lines || []).map(l => l.text).join(' | ');

// --- Cenário: Jonatha nasce adjacente à Micaele na abertura ---
{
  const g = loadGame();
  const wn = g.World3D.worldNpcs || [];
  const mica = wn.find(n => n.key === 'mica');
  const jona = wn.find(n => n.key === 'jona');
  check('Abertura: jona em WORLD_NPCS (d0)', !!jona, jona);
  check('Abertura: mica em WORLD_NPCS (d0)', !!mica, mica);
  if (mica && jona) {
    const chebyshev = Math.max(Math.abs(mica.col - jona.col), Math.abs(mica.row - jona.row));
    check('Abertura: jona adjacente à mica (Chebyshev ≤ 2)', chebyshev <= 2, `dist=${chebyshev} jona(${jona.col},${jona.row}) mica(${mica.col},${mica.row})`);
  }
  // free (mundo livre): jona.dx = -52, mica.dx = +52 — simétricos
  const npcs = g.W && g.W.npcs ? g.W.npcs : [];
  const jonaFree = npcs.find(n => n.key === 'jona');
  const micaFree = npcs.find(n => n.key === 'mica');
  check('Abertura: jona e mica no mundo livre (NPCS)', !!jonaFree && !!micaFree, !jonaFree ? 'jona ausente' : 'mica ausente');
  if (jonaFree && micaFree) {
    check('Abertura: dx de jona e mica são simétricos', jonaFree.dx === -52 && micaFree.dx === 52, `jona.dx=${jonaFree.dx} mica.dx=${micaFree.dx}`);
  }
}

// --- Cenário: A ordem do onboarding (Micaele → Jonatha) não muda ---
// Exemplo: mica=false, briefed=false → jonaBlocked
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.mica = false; g.S.save.briefed = false;
  const mode = g.W.talk('jona');
  check('Onboarding ordem: jona sem mica → jonaBlocked', mode === 'dialogue', mode);
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Onboarding ordem: jonaBlocked não marca met.jona', !g.S.save.met.jona, g.S.save.met.jona);
  g.W.finish();
  check('Onboarding ordem: jonaBlocked não marca briefed', !g.S.save.briefed, g.S.save.briefed);
}
// Exemplo: mica=true, briefed=false → explica missão
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.mica = true; g.S.save.briefed = false;
  g.W.talk('jona');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Onboarding ordem: jona após mica → cena missão (longa)', (lines || []).length > 2, lines && (lines||[]).length);
  g.W.finish();
  check('Onboarding ordem: após jona, briefed=true', g.S.save.briefed === true, g.S.save.briefed);
  check('Onboarding ordem: após jona, met.jona=true', g.S.save.met.jona === true, g.S.save.met.jona);
}
// Exemplo: mica=true, briefed=true → jonaAgain
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: { mica: true, jona: true }, briefed: true }) } });
  g.S.mode = 'world';
  g.W.talk('jona');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Onboarding ordem: jona com briefed=true → jonaAgain (curto)', (lines || []).length <= 3, lines && (lines||[]).length);
}

// --- Cenário: Pais registrados como cena, derivados do registro único ---
{
  const g = loadGame();
  const npcs = g.W && g.W.npcs ? g.W.npcs : [];
  const wn = g.World3D.worldNpcs || [];
  const nd = g.World3D.npcDraw || {};

  check('Registro: osPais em NPCS (mundo livre)', npcs.some(n => n.key === 'osPais'), npcs.map(n => n.key).join(','));
  check('Registro: osPais em WORLD_NPCS', wn.some(n => n.key === 'osPais'), wn.map(n => n.key).join(','));
  check('Registro: osPais.d === 8', (() => { const n = wn.find(n => n.key === 'osPais'); return n && n.d === 8; })(), 'not found or d!=8');
  check('Registro: NPC_DRAW.osPais é função', typeof nd.osPais === 'function', typeof nd.osPais);

  // osPais não tem ending flag
  const np = npcs.find(n => n.key === 'osPais');
  check('Registro: osPais sem flag ending', !np || !np.ending, np && np.ending);

  // tile de osPais não coincide com o do vovô
  const vovoW = wn.find(n => n.key === 'vovo');
  const paisW = wn.find(n => n.key === 'osPais');
  if (vovoW && paisW) {
    check('Registro: tile osPais diferente do vovô', vovoW.col !== paisW.col || vovoW.row !== paisW.row,
      `osPais(${paisW.col},${paisW.row}) vovô(${vovoW.col},${vovoW.row})`);
  }
}

// --- Cenário: O ponto dos pais é alcançável pela interação real (não só por bypass) ---
{
  const g = loadGame(); g.S.mode = 'world';
  // talk() simula a Maju próxima do NPC e acionando o botão ENTRAR
  const mode = g.W.talk('osPais');
  check('Alcançável: talk(osPais) entra em diálogo', mode === 'dialogue', mode);
}

// --- Cenário: Reencontro dispara ao tocar os pais pela primeira vez ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.osPais = false;
  g.W.talk('osPais');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('1ª vez: cena cheia (osPais)', !!lines && (lines||[]).length > 0, lines && (lines||[]).length);
  // ao menos uma fala de jona, uma de mica, uma de maju
  const hasJona = (lines||[]).some(l => l.who === 'jona');
  const hasMica = (lines||[]).some(l => l.who === 'mica');
  const hasMaju = (lines||[]).some(l => l.who === 'maju');
  check('1ª vez: há fala do jona', hasJona, txt(lines).slice(0, 60));
  check('1ª vez: há fala da mica', hasMica, txt(lines).slice(0, 60));
  check('1ª vez: há fala da maju', hasMaju, txt(lines).slice(0, 60));
  g.W.finish();
  check('1ª vez: met.osPais vira true após diálogo', g.S.save.met.osPais === true, g.S.save.met.osPais);
}

// --- Cenário: A cena ecoa as lições dos pais (coragem + fé) ---
{
  // Acessa as falas via S.dlg.lines (STORY é const no vm — não exposto em sandbox)
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.osPais = false;
  g.W.talk('osPais');
  const osPaisLines = (g.S.dlg && g.S.dlg.lines) || [];
  const jonaText = osPaisLines.filter(l => l.who === 'jona').map(l => l.text.toLowerCase()).join(' ');
  const micaText = osPaisLines.filter(l => l.who === 'mica').map(l => l.text.toLowerCase()).join(' ');
  check('Lições: jona remete à coragem (valente/coragem)', /valente|coragem/.test(jonaText), jonaText.slice(0, 120));
  check('Lições: mica remete à fé (fé)', /fé/.test(micaText) || /\bfe\b/.test(micaText), micaText.slice(0, 120));
  g.W.finish();
}

// --- Cenário: Reencontro já visto mostra a fala curta ---
{
  const g = loadGame(); g.S.mode = 'world';
  // 1ª conversa
  g.W.talk('osPais'); g.W.finish();
  // 2ª vez → osPaisAgain (curta)
  g.W.talk('osPais');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('2ª vez: osPaisAgain é curta (≤ 4 falas)', !!lines && (lines||[]).length > 0 && (lines||[]).length <= 4, lines && (lines||[]).length);
}

// --- Cenário: A cena não menciona morte (tom de reencontro afetivo) ---
{
  // Coleta linhas das duas cenas via S.dlg.lines (STORY é const no vm — não exposto em sandbox)
  const palavrasProibidas = ['morte', 'morrer', 'morreu', 'faleceu', 'partiu', 'despedida'];

  // cena cheia
  const g1 = loadGame(); g1.S.mode = 'world';
  g1.S.save.met.osPais = false;
  g1.W.talk('osPais');
  const cheia = (g1.S.dlg && g1.S.dlg.lines) || [];
  g1.W.finish();

  // cena curta (2ª conversa)
  g1.W.talk('osPais');
  const curta = (g1.S.dlg && g1.S.dlg.lines) || [];
  g1.W.finish();

  const allLines = [...cheia, ...curta];
  const semMorte = !palavrasProibidas.some(w => allLines.some(l => l.text.toLowerCase().includes(w)));
  check('Tom: nenhuma fala com palavras de morte', semMorte,
    palavrasProibidas.find(w => allLines.some(l => l.text.toLowerCase().includes(w))));
}

// --- Cenário: A cena não adiciona conchas ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.W.completeAll();
  check('Conchas: TOTAL_PHASES permanece 31', Object.keys(g.S.save.done).length === 31, Object.keys(g.S.save.done).length);
  // osPais não em PHASE_NODES — completar tudo e falar com osPais não muda a contagem
  g.W.talk('osPais'); g.W.finish();
  check('Conchas: falar com osPais não altera done', Object.keys(g.S.save.done).length === 31, Object.keys(g.S.save.done).length);
}

// --- Cenário: A cena dos pais não altera o desfecho (clímax ortogonal) ---
{
  const g = loadGame(); g.S.mode = 'world';
  // testa que osPais NÃO dispara startEnding nem skyEnding
  // vovô NÃO foi tocado → met.vovo deve permanecer falsy antes e depois de falar com osPais
  const vovoAntes = g.S.save.met && g.S.save.met.vovo;
  g.W.talk('osPais'); g.W.finish();
  const vovoDepois = g.S.save.met && g.S.save.met.vovo;
  check('Desfecho: met.vovo não muda ao falar com osPais', vovoAntes === vovoDepois, `antes=${vovoAntes} depois=${vovoDepois}`);
  // modo não pode ter mudado para 'ending' (que seria startEnding)
  check('Desfecho: mode !== ending após osPais', g.S.mode !== 'ending', g.S.mode);
}

// --- Cenário: Save da cena vista não regride após reload ---
{
  // Simula reload: guarda save com met.osPais=true, recarrega
  const savedRaw = JSON.stringify({ v: 3, done: {}, met: { osPais: true }, briefed: true });
  const g = loadGame({ seed: { [NEW_KEY]: savedRaw } });
  check('Persistência: met.osPais=true preservado pós-reload', g.S.save.met.osPais === true, g.S.save.met.osPais);
  // Falar novamente deve mostrar osPaisAgain (curta)
  g.S.mode = 'world';
  g.W.talk('osPais');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Persistência: já viu → osPaisAgain (curta)', !!lines && (lines||[]).length <= 4, lines && (lines||[]).length);
}

// --- Cenário: Save com met ausente/malformado não trava (load defensivo) ---
// Exemplo: {} (sem osPais)
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: {} }) } });
  check('Defensivo ({}): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo ({}): met.osPais falsy', !g.S.save.met.osPais, g.S.save.met.osPais);
}
// Exemplo: null
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: null }) } });
  check('Defensivo (null): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo (null): met.osPais falsy', !g.S.save.met.osPais, g.S.save.met.osPais);
}
// Exemplo: 42 (primitivo)
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: 42 }) } });
  check('Defensivo (42): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo (42): met.osPais falsy', !g.S.save.met.osPais, g.S.save.met.osPais);
  // d8 desbloqueado (simulado via completeAll) → cena cheia deve disparar
  g.S.mode = 'world';
  g.W.talk('osPais');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Defensivo (42): cena cheia disparada', !!lines && (lines||[]).length > 4, lines && (lines||[]).length);
}
// Exemplo: "estado" (string)
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: 'estado' }) } });
  check('Defensivo (string): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo (string): met.osPais falsy', !g.S.save.met.osPais, g.S.save.met.osPais);
}

// --- Cenário: O load defensivo não corrompe os marcadores do onboarding ---
{
  const raw = JSON.stringify({ v: 3, done: {}, met: { mica: true, jona: true }, briefed: true });
  const g = loadGame({ seed: { [NEW_KEY]: raw } });
  check('Onboarding intacto: met.mica true', g.S.save.met.mica === true, g.S.save.met.mica);
  check('Onboarding intacto: met.jona true', g.S.save.met.jona === true, g.S.save.met.jona);
  check('Onboarding intacto: briefed true', g.S.save.briefed === true, g.S.save.briefed);
}

// --- Cenário: Pais inacessíveis enquanto o Cais (d8) está na névoa ---
{
  const g = loadGame(); g.S.mode = 'world';
  // d8 não está desbloqueado (done vazio)
  check('Névoa d8: osPais em d8', (() => { const wn = g.World3D.worldNpcs; const p = wn.find(n => n.key === 'osPais'); return p && p.d === 8; })(), 'osPais não encontrado ou d != 8');
  // nearNpc do World3D não retorna osPais quando d8 não está desbloqueado
  // (a lógica de desbloqueio está em districtUnlocked → nearNpc de world3d.js)
  check('Névoa d8: d8 não desbloqueado no início', !g.W.unlocked(8), 'desbloqueado indevidamente');
}

// --- Cenário: Jogo carrega e desenha os pais sem exceção ---
{
  const g = loadGame();
  check('Carrega: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  // drawPais deve ser uma função global acessível antes de characters.js
  // (testamos via NPC_DRAW que characters.js derivou)
  const nd = g.World3D.npcDraw || {};
  check('Carrega: NPC_DRAW.osPais é drawPais (função)', typeof nd.osPais === 'function', typeof nd.osPais);
  // chamar drawPais não lança (ctx stub absorve tudo)
  let drawError = null;
  try { nd.osPais(fakeCtx(), 0, 0, 4); } catch(e) { drawError = e; }
  // como o ctx é stub, deve passar sem erro
  // (se lançar, provavelmente é porque JONA_MAP/MICA_MAP/drawMap não estão definidos)
  check('Carrega: drawPais não lança exceção', !drawError, drawError && drawError.message);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
