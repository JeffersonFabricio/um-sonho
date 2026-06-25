# Tasks — 005-alinhamento-planetas

> Ordem TDD-adaptado (brownfield, validação manual via `window.__*`). Cada task fecha com
> `feat(<scope>): cenário "<nome>"`. Mapeamento → cenários de [spec.bdd.md](spec.bdd.md).

| # | Task | Arquivo(s) | Cenário(s) BDD |
|---|------|-----------|----------------|
| T1 | Criar `drawRosaDosVentos(ctx, cx, cy, r)` — anel externo `#1d6fa3`, miolo `#f5efe0`, estrela de 8 pontas colorida (tokens da paleta) | `js/sprites.js` | "Existe um único helper de desenho do disco (DRY)" |
| T2 | `SCENES[1].s`: substituir o stub (sprites.js:879-883) por `drawRosaDosVentos` grande e centrado na praça | `js/sprites.js` | "O piso do Marco Zero é o grande disco circular, não o stub antigo" |
| T3 | `class OrbitPuzzle` + registrar `11: OrbitPuzzle` em `PUZZLES`; embaralhar `pos = 1 + rnd(7)` (nunca Norte); cores reusando `['#d94f4f','#f2c038','#5b8bd9','#67b06b']` | `js/puzzles.js` | "OrbitPuzzle registrado e com a interface esperada"; "A fase nunca abre já resolvida e é sempre solúvel" |
| T4 | `OrbitPuzzle.draw` reusa `drawRosaDosVentos` + pinta cada planeta no ângulo de `pos` + destaca o eixo Norte; expor geometria (`cx,cy,radii[]` / `topPointOf(i)`) para teste | `js/puzzles.js` | "O tabuleiro do puzzle reusa o piso (mesmo disco da cena)" |
| T5 | `OrbitPuzzle.tap(x,y)`: acha anel pela distância ao centro, `pos=(pos+1)%8`, `AudioFX.blip`; tap fora = no-op; `if(this.solved) return` | `js/puzzles.js` | "Tocar um anel gira só aquele anel um passo"; "Tocar fora de qualquer anel não faz nada"; "Toques após resolver não desalinham" |
| T6 | Win: `rings.every(r => r.pos === 0)` → `solved = true` + `AudioFX.win()`; verificar fluxo `done[3]` + save (já em `afterBead`) | `js/puzzles.js` | "Alinhar todos os planetas no Norte resolve a fase"; "Progresso não regride após reload" |
| T7 | Fase g=3 `e: 9`→`e: 11` + `engineCfg` `case 11: return { rings: 3 + tier }` | `js/levels.js` | "A troca de engine não muda a contagem de conchas"; "O tabuleiro... cfg.rings === 3" |
| T8 | `PUZZLE_HINTS[11]` em PT-BR ("girar os anéis / alinhar no Norte") | `js/story.js` | "OrbitPuzzle registrado..." (parte do hint) |
| T9 | Smoke manual no navegador: carrega sem erro de console; cena + puzzle desenham; rodar o roteiro `window.__*`; load defensivo de save malformado | — (validação) | "Jogo carrega... sem exceção"; "Save sem ou com done malformado não trava" |

## Notas

- **Sem prototype:** projeto Canvas puro (`DESIGN.md` `system: custom`) — `/prototype` não se aplica.
- **CHANGELOG:** não exigido — a mudança é só em código do jogo (`js/*`), não toca o harness
  (`.sdd/`, `.claude/`, etc.).
- **Ordem dos `<script>` inalterada** — só edição de arquivos já carregados (`sprites.js` antes de
  `puzzles.js` garante o reúso do helper).
