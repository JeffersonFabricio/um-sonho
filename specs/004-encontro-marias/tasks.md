# Tasks — 004-encontro-marias

> Ordem TDD cenário a cenário (RED → GREEN → REFACTOR). 1 commit por cenário verde.
> ADR: [ADR-003](../../docs/adr/ADR-003-cena-reencontro-marias.md) · Blueprint: [blueprint.mermaid](blueprint.mermaid)
> Revisão paralela dos specialists: aplicada (product + qa + security). Ajustes P0/P1 já incorporados ao BDD.

| # | Task | Cenário(s) BDD | Arquivos |
|---|------|----------------|----------|
| 1 | `drawIgrejaMarias` em `sprites.js` (torre de igreja extraída de `casa()` + `drawVova` + `drawVovoMae` lado a lado). Declarar antes de `world3d.js` no `index.html` | Igreja registrada/desenhada por código; carrega sem exceção | `js/sprites.js`, `index.html` |
| 2 | Entrada `asMarias` em `WORLD_NPCS` (tile na fronteira d6↔d7); `NPC_DRAW.asMarias`. NÃO adicionar a `PHASE_NODES` | Igreja registrada como cena; não adiciona conchas | `js/world3d.js` |
| 3 | Gate de interação: tocar a igreja só abre a cena cheia se `met.vova && met.vovoMae`; senão dica genérica sem marcar save | Gate narrativo (Scenario Outline, 3 combinações) | `js/main.js` ou `js/world3d.js` |
| 4 | Diálogos `STORY.meet.asMarias` (cena cheia: nar/vova/vovoMae/maju, honra o nome Maria) + `asMariasAgain` (curta) | Reencontro dispara; já visto mostra curta; sem palavras de morte | `js/story.js` |
| 5 | Marcar `met.asMarias` ao concluir; reload preserva (parseSave já defensivo) | Save não regride após reload; save malformado | `js/main.js` |
| 6 | Validar acesso: igreja inalcançável enquanto d6/d7 na névoa; ajustar tile se necessário | Igreja inacessível na névoa | `js/world3d.js` (validação) |
| 7 | Validar invariantes: TOTAL_PHASES=31, igreja fora de PHASE_NODES, console limpo | Não adiciona conchas; carrega sem erro | manual `window.__*` |
| 8 | Revisão editorial humana: tom amoroso/sereno, reencontro (não despedida), serenidade luminosa | (nota editorial, não automatizável) | `js/story.js` |

**Ordem sugerida:** 1 → 2 → 4 → 3 → 5 → 6 → 7 (sprite e dados antes do gate e do save).
