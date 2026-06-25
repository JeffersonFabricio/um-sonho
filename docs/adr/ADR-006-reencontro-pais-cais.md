# ADR-006 — Reencontro dos pais no Cais (cena interativa no distrito do desfecho)

> Status: Proposto · Data: 2026-06-24 · Spec: `specs/005-reencontro-pais/`
> Estende: [ADR-003](ADR-003-cena-reencontro-marias.md) (cena gatilhada por local) · Apoia-se em: [ADR-005](ADR-005-registro-unico-elenco.md) (registro único de elenco)

## Contexto

A spec 005 pede que **Jonatha e Micaele** (os pais, que abrem o mundo no d0) **reapareçam juntos, de forma interativa, no Cais da Alfândega (d8)** — o distrito do desfecho. É o mesmo *tipo* de elemento da [ADR-003](ADR-003-cena-reencontro-marias.md): cena especial gatilhada por um ponto no mapa, com versão de reencontro (`key + 'Again'`), **sem somar concha**.

Desde a ADR-003, o elenco foi unificado num **registro único** ([ADR-005](ADR-005-registro-unico-elenco.md), `js/characters.js`): cada personagem é declarado **uma vez** em `CHARACTERS`, e `NPCS`/`SPEAKERS` (main.js) + `WORLD_NPCS`/`NPC_DRAW` (world3d.js) são **projeções derivadas** (`Characters.npcs()`/`speakers()`/`worldNpcs()`/`npcDraw()`). Cada personagem declara o canônico (`name`, `color`, `draw`, `d`, `lesson?`, `ending?`) + posição por-view:
- `free: { dx, dy }` → entra no **mundo livre** (NPCS — é onde o `talkNpc`/`__world.talk` operam).
- `world: { col, row, label?, color? }` → entra no **passeio final** (WORLD_NPCS — world3d.js).

Duas particularidades além da ADR-003:

1. **O local é o distrito do desfecho (d8).** O `vovo` (Vovô Maro) já vive ali (`d:8`, `ending:true`) e dispara o `skyEnding` (`talkNpc` caso `npc.key === 'vovo'`, main.js:884, e `startEnding` quando `npc.ending && doneCount() >= TOTAL_PHASES`, main.js:881). Inserir os pais **não pode alterar o clímax**.
2. **A abertura (d0) precisa dos pais lado a lado.** No `free` (mundo livre) `jona`/`mica` já são simétricos (`dx:-52` / `dx:+52`, mesmo `dy`). No `world` (passeio final) estão distantes (`col:8,row:9` vs `col:3,row:6`).

## Decisão

Aplicar o padrão da ADR-003 via o registro único da ADR-005:

- **Uma única entrada `osPais` em `CHARACTERS`** (`js/characters.js`), espelhando o `vovo`:
  `{ name: 'PAINHO E MAINHA', color, draw: drawPais, d: 8, lesson?, free: { dx, dy }, world: { col, row, label } }`.
  As projeções (`NPCS`, `SPEAKERS`, `WORLD_NPCS`, `NPC_DRAW`) o herdam automaticamente — **não se edita world3d.js nem main.js para registrar o NPC** (correção em relação ao padrão pré-ADR-005).
  - `free` garante que `osPais` é **interativo no mundo livre** (entra em `NPCS`, logo `__world.talk('osPais')`/`talkNpc` funcionam).
  - `world` o mostra também no passeio final, próximo (sem sobrepor) ao Vovô Maro.
  - **Sem `ending`**: nunca dispara `startEnding`. **Sem ser concha**: como não tem nada a ver com `PHASE_NODES`, `TOTAL_PHASES` continua 31.
- **`drawPais(ctx, x, y, s)` novo em `js/sprites.js`**, reusando `drawJonatha` + `drawMicaele` lado a lado, no molde de `drawPrimos` (sprites.js:308). **Em `sprites.js`** porque ele carrega **antes** de `characters.js` (index.html: sprites → characters → … → world3d → main), que referencia `drawPais` no campo `draw`. (FF-002 — risco clássico de ordem de `<script>`.)
- **Diálogo** `STORY.meet.osPais` (cena cheia: `nar`/`jona`/`mica`/`maju`) + `STORY.meet.osPaisAgain` (curta), em `js/story.js`.
- **Pipeline `talkNpc` reusado sem alteração** (main.js:900-912): 1ª conversa (`!met.osPais`) → cena cheia; depois → `osPaisAgain`; grava `met.osPais=true` ao concluir o diálogo. Confirmar que `osPais` **não** cai no caso `vovo` (884) nem em `startEnding` (881, pois `osPais.ending` é falsy).
- **Gate posicional, não de estado:** o ponto só é alcançável quando o **d8 está desbloqueado** (`districtUnlocked` lê `S.save.done` ao vivo). Como chegar ao d8 exige g1–28, o reencontro só ocorre perto do fim — sem precisar de `met.* && ...` como na 004.
- **Abertura (d0):** alinhar as posições de `jona` para ficar **adjacente** à `mica` nas duas vistas — `free` já é simétrico; ajustar o `world` de `jona` (hoje `col:8,row:9`) para perto do de `mica` (`col:3,row:6`). **Só posição** — o gating Micaele→Jonatha (`jonaBlocked`, main.js:895) e os estados (`met.mica`/`briefed`) ficam idênticos à spec 001.

## Alternativas consideradas

- **Injetar os pais no `skyEnding`/cutscene do Vovô Maro** — rejeitado: o final já é denso e o cliente pediu algo **interativo**, não outra fala no clímax. NPC opcional preserva o ritmo do desfecho.
- **Reencontro no meio da jornada (d4, Mercado de São José)** — considerado (único distrito sem familiar), mas o cliente escolheu o **Cais (d8)**: a família se completa onde a jornada termina.
- **Editar `WORLD_NPCS`/`NPCS` diretamente** (como a ADR-003 fazia) — rejeitado: violaria a fonte única da ADR-005 e duplicaria o personagem em duas estruturas (risco de divergência exatamente como antes da ADR-005).
- **Tratar como nó de fase/puzzle** — violaria `TOTAL_PHASES = 31` (FF-DOM-2) e transformaria uma cena afetiva num desafio.

## Consequências

**Positivas**
- Mudança mínima e coesa: 1 entrada no registro + 1 helper de desenho + 2 entradas em `STORY.meet`. **Zero edição** em main.js/world3d.js para registrar o NPC (a ADR-005 paga esse dividendo).
- `TOTAL_PHASES = 31` e o desfecho intactos.
- Fecha a simetria do jogo: pais na abertura (d0) **e** no fim (d8); as Marias na igreja (004).

**Negativas / riscos**
- **Ordem dos `<script>` (FF-002):** `drawPais` precisa estar em `sprites.js` (carrega antes de `characters.js`). Validar console limpo.
- **Proximidade do clímax:** validar que o `world`/`free` de `osPais` no d8 não colide com o Vovô Maro nem com nós de concha, e que falar com os pais **não** altera `met.vovo` nem dispara o desfecho.
- Sprite duplo precisa de contraste/touch target adequados (Mandato Desejável de acessibilidade de toque).

## Conformidade com a Lei do Domínio

- §1 (31 conchas) — preservado: a cena não é concha; `TOTAL_PHASES` permanece 31.
- §4 (progresso nunca regride) — `met.osPais` só vira `true`; reload mantém visto; reposição do `jona` não regride `met.mica`/`met.jona`/`briefed`.
- §5 (tudo desenhado por código) — pais via `drawPais`/helpers existentes, zero asset.
- §6 (PT-BR fiel ao Recife) — diálogo em PT-BR, tom afetivo; cais ao pôr do sol como cenário do reencontro.
