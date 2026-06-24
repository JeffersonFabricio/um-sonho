# ADR-003 — Cena de reencontro das Marias (igreja interativa)

> Status: Proposto · Data: 2026-06-24 · Spec: `specs/004-encontro-marias/`

## Contexto

O jogo tem hoje dois tipos de elemento interativo no mapa-mundo (`world3d.js`):

1. **Nós de fase** (`PHASE_NODES`) — conchas coletáveis que abrem puzzles; somam exatamente `TOTAL_PHASES = 31` (Lei do Domínio §1, FF-DOM-2).
2. **NPCs** (`WORLD_NPCS`) — personagens-guia da família; tocar abre um diálogo (`STORY.meet[key]`), com versão de reencontro (`key + 'Again'`) controlada por `met[key]`.

O cliente pediu uma **cena de reencontro entre as duas avós Marias** (Maria José, viva, `vova`/d6; Maria Rita, no céu, `vovoMae`/d7) numa **igreja**. Isso não é um puzzle (não pode somar concha, senão quebra `TOTAL_PHASES = 31`) nem um NPC-guia comum (envolve **dois** personagens já existentes num **terceiro local** e tem **pré-condição narrativa**: só faz sentido depois de conhecer as duas avós).

## Decisão

Introduzir um **terceiro tipo de elemento**: uma **cena especial gatilhada por um ponto-igreja**, modelada como uma entrada dedicada em `WORLD_NPCS` (reusa o pipeline de toque/interação e de diálogo já existente), com:

- **`key: 'asMarias'`** (ou equivalente), posicionada num tile da região **d6/d7** (proposta: na fronteira d6↔d7, lado do mangue — ajustável no `/implement`).
- **Sprite próprio** (`drawIgreja` + as duas avós), reusando primitivas de desenho (`PR`, `drawMap`, `drawVova`, `drawVovoMae`) e a paleta de `DESIGN.md` — **sem asset externo** (Lei do Domínio §5).
- **Gate narrativo**: o reencontro só dispara quando `met.vova && met.vovoMae`. Antes disso, tocar a igreja mostra uma dica suave ("ainda não é hora") e não marca nada.
- **Diálogo novo** `STORY.meet.asMarias` (cena cheia) + `asMariasAgain` (fala curta), seguindo o padrão `met[key]` → `Again`.
- **Não incrementa `TOTAL_PHASES`**: a igreja não entra em `PHASE_NODES`; é elemento de cena, não de coleta.

## Alternativas consideradas

- **Realocar as duas avós pra perto da igreja, sem cena nova** — rejeitado pelo cliente (queriam um encontro, não só reposicionamento).
- **Tratar como NPC comum** — não comporta a pré-condição de "ter conhecido as duas avós" nem o fato de serem dois personagens num local distinto dos seus distritos de origem.
- **Tratar como nó de fase/puzzle** — violaria `TOTAL_PHASES = 31` (FF-DOM-2) e transformaria uma cena afetiva num desafio.

## Consequências

**Positivas**
- Reusa o pipeline de toque + diálogo + `met[key]`/`Again` existente — pouco código novo.
- Mantém `TOTAL_PHASES = 31` intacto (a cena é ortogonal à coleta de conchas).
- Cria um padrão reaproveitável para futuras cutscenes gatilhadas por local.

**Negativas / riscos**
- Toca 2+ arquivos JS (`world3d.js`, `story.js`, `sprites.js`, possivelmente `main.js`) — por isso este ADR (Acordo do Time §6).
- **Ordem dos `<script>` (risco clássico do projeto — Mandato Inviolável / FF-002):** `drawIgrejaMarias` precisa estar declarada em `sprites.js`, que já carrega **antes** de `world3d.js` no `index.html`. Ao implementar, confirmar que o novo helper fica em `sprites.js` (não em `world3d.js`) para não quebrar o console na ordem de carga.
- A condição de gate (`met.vova && met.vovoMae`) depende dos distritos d6 e d7 estarem acessíveis; validar que o jogador consegue chegar à igreja no fluxo real.
- Sprite da igreja precisa de cuidado de contraste/touch target (Mandato Desejável de acessibilidade de toque).

## Conformidade com a Lei do Domínio

- §1 (31 conchas) — preservado: a cena não é concha.
- §4 (progresso nunca regride) — `met.asMarias` só vira `true`; reload mantém visto.
- §5 (tudo desenhado por código) — igreja e avós via helpers, zero asset.
- §6 (PT-BR fiel ao Recife) — diálogo em PT-BR, tom afetivo; igreja como espaço sagrado nordestino.
