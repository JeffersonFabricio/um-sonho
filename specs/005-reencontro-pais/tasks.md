# Tasks — 005-reencontro-pais

> Ordem sugerida para o `/implement` (TDD por cenário, baseline brownfield = validação manual via `window.__*`).
> Cada task mapeia para 1+ cenário de [spec.bdd.md](spec.bdd.md). Padrão: [ADR-006](../../docs/adr/ADR-006-reencontro-pais-cais.md) (cena por local) + [ADR-005](../../docs/adr/ADR-005-registro-unico-elenco.md) (registro único).

## T1 — Sprite duplo dos pais (`js/sprites.js`)
Criar `drawPais(ctx, x, y, s = U)` reusando `drawJonatha` + `drawMicaele` lado a lado (molde de `drawPrimos`, sprites.js:308). **Em `sprites.js`** (carrega antes de `characters.js` — FF-002). Vem primeiro porque o registro referencia `drawPais`.
**Cobre:** "desenhados por código", "carrega e desenha sem exceção".

## T2 — Diálogo dos pais no cais (`js/story.js`)
Adicionar `STORY.meet.osPais` (cena cheia: `nar`/`jona`/`mica`/`maju`) e `STORY.meet.osPaisAgain` (curta), a partir do draft em [story.md](story.md). Garantir falas que ecoam coragem (jona) e fé (mica), sem palavras de morte.
**Cobre:** "Reencontro dispara…", "ecoa as lições", "fala curta", "não menciona morte".

## T3 — Entrada única no registro de elenco (`js/characters.js`)
Adicionar **uma** entrada `osPais` a `CHARACTERS` (`d:8`, `draw: drawPais`, `free`, `world`, `lesson` opcional), espelhando o `vovo` — **sem** flag `ending`. As projeções (`NPCS`/`SPEAKERS`/`WORLD_NPCS`/`NPC_DRAW`) herdam de graça. Escolher tiles do cais que **não** colidem com o Vovô Maro nem com nós de concha.
**Cobre:** "Pais registrados como cena", "alcançável pela interação real", "não adiciona conchas", "não altera o desfecho", "inacessíveis na névoa".

## T4 — Reposicionar Jonatha na abertura (`js/characters.js`)
Ajustar o `world` de `jona` (hoje `col:8,row:9`) para adjacente ao `world` de `mica` (`col:3,row:6`); o `free` já é simétrico (`dx:∓52`). **Só posição** — nada de gating.
**Cobre:** "Jonatha nasce adjacente à Micaele", "A ordem do onboarding não muda".

## T5 — Verificação do pipeline genérico (`js/main.js`)
Confirmar (sem alterar, se possível) que `talkNpc` trata `osPais` pelo caminho genérico: 1ª vez → `osPais`, depois → `osPaisAgain`, gravando `met.osPais=true` ao concluir (main.js:900-912); e que **não** cai no caso `vovo` (884) nem em `startEnding` (881). Verificar `met.vovo` inalterado após `talk('osPais')`.
**Cobre:** "fala curta", "clímax ortogonal", "save não regride".

## T6 — Save defensivo e regressão
Validar load defensivo (`met` ausente/null/primitivo/string não trava; `met.osPais` falsy por padrão) e persistência (visto não regride após reload); confirmar que `met.mica`/`met.jona`/`briefed` permanecem após a reposição do `jona`.
**Cobre:** "Save da cena vista não regride", "Save com met ausente/malformado não trava", "load defensivo não corrompe o onboarding".

## T7 — Validação manual end-to-end (`window.__*`)
Rodar o roteiro de [spec.bdd.md](spec.bdd.md): posição (free simétrico + world adjacente), `npcs.find('osPais')≠null`, `completeAll()` → `toNpc` → cena cheia → Again, met.vovo intacto, persistência, load primitivo, grep de tom, `TOTAL_PHASES===31`. Console limpo (FF-002).
**Cobre:** gate de aceite final (todos os cenários).

---

_Revisão paralela por specialists (product · qa · security): executada na Fase 4.5 do `/spec`. Ajustes aplicados: precisão de ACs, exemplo `(true,true)→jonaAgain`, assert de `met.vovo` no clímax, load defensivo com primitivos, cenário de interação real por proximidade, e o achado crítico do QA (NPC precisa entrar em `NPCS` — resolvido pela config `free` no registro único da ADR-005)._
