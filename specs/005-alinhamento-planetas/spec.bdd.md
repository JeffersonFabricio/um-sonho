# Spec BDD — Marco Zero: piso da rosa dos ventos + puzzle de alinhamento

> Feature: `005-alinhamento-planetas` · Story: [story.md](story.md) · ADR: [ADR-004](../../docs/adr/ADR-004-motor-alinhamento-planetas.md)
> Validação: manual no navegador via `window.__*` (sem framework — baseline brownfield). Roteiro concreto no fim.

```gherkin
Funcionalidade: O grande disco da rosa dos ventos no Marco Zero, jogável
  Para que o Marco Zero pareça o lugar de verdade (o disco circular de Cícero Dias)
  e a fase "Rosa dos Ventos" (g=3) combine com ele, a praça ganha o disco no chão
  e a concha vira um puzzle de girar os anéis até alinhar os planetas no Norte —
  sem adicionar fases (continuam 31 conchas).

  Contexto:
    Dado que a fase g=3 pertence ao cordão "Dias de Sol" (Recife Antigo), cena 1
    E que o jogo carrega os scripts na ordem sprites.js → ... → puzzles.js
    E que a validação é feita no navegador via window.__*

  # ---------- (a) piso fiel + helper compartilhado ----------

  Cenário: O helper de desenho do disco está exposto em runtime
    Quando o jogo é carregado
    Então typeof drawRosaDosVentos === "function" (helper em js/sprites.js)
    E ela desenha o disco 100% por código (sem Image, sem asset externo)
    # DRY (nenhuma outra função recria a arte do disco) é critério de CODE-REVIEW, não de runtime

  Cenário: O piso do Marco Zero é o grande disco circular da rosa dos ventos
    Quando a cena 1 (Marco Zero) é desenhada
    Então o chão da praça exibe um disco circular grande e centrado
    E o raio do disco é ≥ 120px (ocupa a maior parte da largura de 360px da cena)
    E o disco tem anel externo (#1d6fa3 --azul-passo), miolo creme (#f5efe0 --marfim) e uma
      rosa dos ventos de 8 pontas colorida ao centro (tokens --ouro #f2c038 / --vermelho-perigo
      #d94f4f / --azul-passo #5b8bd9 / --verde-mangue #67b06b / --lilas-festa #c97bb6)
    E todos os hexes usados constam na paleta de .sdd/DESIGN.md (sem hex novo ad hoc)
    # A remoção do stub antigo (sprites.js:879-883) é critério de CODE-REVIEW (source-level)

  # ---------- (b) o 11º motor: OrbitPuzzle ----------

  Cenário: OrbitPuzzle registrado e com a interface esperada
    Quando o jogo é carregado
    Então PUZZLES[11] é a classe OrbitPuzzle
    E new PUZZLES[11]({ rings: 3 }) não lança erro
    E a instância expõe os métodos tap, update e draw e a flag solved
    E PUZZLE_HINTS[11] é uma string em PT-BR descrevendo "girar os anéis / alinhar no Norte"

  Cenário: O tabuleiro do puzzle é o mesmo disco da cena
    Quando a fase g=3 entra no modo puzzle
    Então o tabuleiro exibido é o disco da rosa dos ventos (mesmo raio, cores e marcações N/NE/E/…)
    E há N anéis concêntricos, N === window.__game.puzzle.rings.length === cfg.rings
    E para g=3 (tier 0) cfg.rings === 3
    # "draw reusa drawRosaDosVentos" é critério de CODE-REVIEW; a identidade visual é revisão humana

  Cenário: A fase nunca abre já resolvida e é sempre solúvel
    Dado que window.__openLevel(3) seguido de window.__world.finish() entrou no puzzle
    Então window.__game.puzzle.solved é false
    E nenhum anel começa na posição Norte (pos ∈ [1,7]; todo planeta precisa de ≥ 1 toque)
    E cada anel tem exatamente 8 posições discretas (os 8 pontos da rosa dos ventos)
    E o Norte é alcançável em ≤ 7 toques por anel pela rotação cíclica (pos+1) % 8 — sem deadlock
    # Solubilidade é por estrutura cíclica, não por verificação BFS (BFS não se aplica aqui)

  Cenário: Tocar um anel gira só aquele anel um passo
    Dado que o puzzle da fase g=3 está aberto
    E que o anel i está na posição p (p ≠ Norte)
    Quando a Maju toca sobre a faixa do anel i
    Então o anel i avança para a posição (p+1) mod 8 (um passo horário)
    E a posição dos demais anéis não muda

  Cenário: Tocar fora de qualquer anel não faz nada
    Dado que o puzzle da fase g=3 está aberto
    Quando a Maju toca o centro do disco (window.__game.puzzle.cx, .cy) ou um ponto fora do disco
    Então nenhum anel gira
    E o jogo não lança erro
    # A área de navegação (10,8,60,40 — botão voltar do HUD) NÃO pertence ao espaço de toque do
    # puzzle: tocar lá sai da fase (enterWorld) — comportamento existente, fora do escopo deste cenário

  Cenário: Alinhar todos os planetas no Norte resolve a fase
    Dado que o puzzle da fase g=3 está aberto e solved é false
    Quando todos os anéis são girados até seus planetas apontarem para o Norte
    Então window.__game.puzzle.solved passa a ser true
    E AudioFX.win() é tocado exatamente uma vez, pelo próprio OrbitPuzzle, na transição !solved→solved
      (o main.js não re-chama win(); o fluxo de bead/done segue em afterBead)
    E ao concluir a fase, done[3] é marcado como true e o save é gravado

  Cenário: Toques após resolver não desalinham (puzzle travado quando solved)
    Dado que o puzzle da fase g=3 está com solved true
    Quando a Maju toca um anel
    Então nenhum anel gira (tap é ignorado após solved)

  # ---------- invariantes do domínio ----------

  Cenário: A troca de engine não muda a contagem de conchas
    Quando o jogo é carregado
    Então TOTAL_PHASES permanece 31
    E DISTRICT_SIZES permanece [4,4,4,4,3,3,3,3,3]
    E a fase g=3 usa engine 11 (e o engine 9 segue em "Maré de Sizígia" e "Rainha Coroada")

  Cenário: Progresso não regride após reload
    Dado um save v3 cujo done contém { "3": true }
    Quando o jogo é recarregado (parseSave)
    Então done[3] continua true
    E a fase g=3 aparece como concluída

  Cenário: Save sem ou com done malformado não trava (load defensivo)
    Dado um save v3 cujo done não tem a chave "3" (ou cujo done é null)
    Quando o jogo carrega esse save
    Então o jogo carrega sem erro de console
    E abrir a fase g=3 inicia o puzzle normalmente (solved false)

  Cenário: Reload com o puzzle não resolvido recomeça do zero
    Dado que a fase g=3 está aberta com solved false e alguns anéis já girados
    Quando a página é recarregada
    Então o OrbitPuzzle não persiste estado parcial (não há save de progresso do puzzle)
    E reabrir g=3 inicia o puzzle embaralhado de novo (solved false)

  Cenário: Jogo carrega e desenha cena + puzzle sem exceção
    Quando o index.html é aberto no navegador
    Então não há erro no console (FF-002)
    E a cena 1 (com o disco) e o OrbitPuzzle são desenhados sem lançar
    E nenhuma dependência externa nova é carregada (zero-dep preservado)
```

## Roteiro de validação manual (via `window.__*`)

```js
// abre a fase 3 (Rosa dos Ventos) e DRENA a intro — sem finish(), S.mode ainda é 'dialogue'
// e window.__game.puzzle ainda não existe:
window.__openLevel(3);
window.__world.finish();   // hook real (main.js:1381): esvazia o diálogo até virar 'puzzle'
const p = window.__game.puzzle;
p.constructor.name;        // "OrbitPuzzle"
p.solved;                  // false
p.rings.length;            // 3 (tier 0)
p.rings.every(r => r.pos !== 0);   // true — nenhum começa no Norte (0)

// resolve girando cada anel até o Norte (0). OrbitPuzzle expõe a geometria pública
// (p.cx, p.cy e, por anel, p.rings[i].r) + helper p.topPointOf(i) — contrato de teste:
for (let i = 0; i < p.rings.length; i++) {
  while (p.rings[i].pos !== 0) {
    const { x, y } = p.topPointOf(i);   // ponto Norte da faixa do anel i
    window.__tap(x, y);
  }
}
p.solved;                  // true → AudioFX.win() (uma vez)
window.__world.finish();   // drena o diálogo de outro e fecha a fase

// invariantes:
TOTAL_PHASES;              // 31
PUZZLES[11].name;          // "OrbitPuzzle"
typeof drawRosaDosVentos;  // "function"
getLevel(3).engine;        // 11

// persistência (não regride):
const k = 'maresRecife:pernambuco-meu-pais';
const s = JSON.parse(localStorage.getItem(k)); s.done['3'] = true; localStorage.setItem(k, JSON.stringify(s));
location.reload();         // pós: window.__game.save.done['3'] === true
```

> A geometria pública (`p.cx`, `p.cy`, `p.rings[i].r`) e o helper `p.topPointOf(i)` são **contrato
> de teste** do `OrbitPuzzle` — o `/implement` deve expô-los. Onde faltar hook, validar pela aba
> Sources do DevTools.

## Notas de implementação (não-normativas)

- `js/sprites.js`: novo `drawRosaDosVentos(ctx, cx, cy, r)` — anel externo `#1d6fa3`, miolo
  `#f5efe0`, estrela de 8 pontas alternando tokens da paleta; raios concêntricos para as marcações
  N/NE/E/SE/S/SO/O/NO. `SCENES[1].s` chama-o no centro da praça (≈ cx 180, cy 500) **no lugar**
  das linhas 879-883.
- `js/puzzles.js`: `class OrbitPuzzle { constructor({rings}) ... }`. Estado público (contrato de
  teste): `cx`, `cy`, `rings[i] = { pos, cor, r }` com `pos = 1 + rnd(7)` (nunca Norte; `rnd` já
  existe em puzzles.js:25); cores reusando `['#d94f4f','#f2c038','#5b8bd9','#67b06b']`. Expor também
  `topPointOf(i)` → `{x,y}` do Norte da faixa do anel i. `tap(x,y)` → `if (this.solved) return;` no
  topo, acha o anel pela distância ao centro, `pos = (pos+1) % 8`, `AudioFX.blip()`; checa win
  (`rings.every(r => r.pos === 0)`) → `solved` + `AudioFX.win()` **uma vez** (na transição). `draw`
  reusa `drawRosaDosVentos` + pinta cada planeta no ângulo de `pos` + destaca o eixo Norte.
  Registrar `11: OrbitPuzzle` no objeto `PUZZLES` (puzzles.js:1079).
- `js/levels.js`: fase g=3 (CHAPTERS[0].fases[2]) `e: 9` → `e: 11`; manter `t`/`fact` (Cícero Dias).
  `engineCfg`: `case 11: return { rings: 3 + tier };` — para g=3 é sempre tier 0 → `rings` sempre 3;
  a fórmula só escala se o engine 11 for reusado em fase de tier maior no futuro.
- `js/story.js`: `PUZZLE_HINTS[11]` ex.: "Toque em cada anel para girá-lo. Alinhe todos os planetas
  no Norte da rosa dos ventos!". **Obrigatório** — `drawPuzzleHud` (main.js:339) faz
  `PUZZLE_HINTS[L.engine]` → `wrap()`; ausência da chave 11 pode lançar (T8 cobre).
- **Save v2→v3 fora de escopo:** a migração legada é da spec `002-save-namespace`. Esta feature só
  lê/grava `done[3]` como **booleano** — sem novos sub-campos, sem nova superfície de parse.
- **Revisão visual (humano):** fidelidade do disco à foto (proporções, cores da estrela) é critério
  de revisão humana; os cenários cobrem presença/estrutura, não a beleza fina.
