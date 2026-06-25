# ADR-004 — Marco Zero: piso da rosa dos ventos (helper compartilhado) + 11º motor de puzzle

- **Status:** Proposto
- **Data:** 2026-06-24
- **Contexto da spec:** `specs/005-alinhamento-planetas/`

## Contexto

O Marco Zero real (foto do cliente) tem um **grande disco circular** no chão: anel externo
azul-petróleo, miolo creme e a **rosa dos ventos de 8 pontas colorida** de Cícero Dias. Dois
problemas no jogo hoje:

1. **Piso infiel:** a cena do Marco Zero (`SCENES[1]` em `js/sprites.js`, linhas 879-883)
   desenha só um **toco** — um quadrado de 60×60 com duas barrinhas cruzadas. Não parece o lugar.
2. **Puzzle descolado:** a fase **"Rosa dos Ventos"** (g=3, cordão "Dias de Sol") usa o
   **engine 9 (`MixerPuzzle` — "Equalizando o Manguebeat")**, um equalizador de sliders que não
   tem relação com o título nem com o Marco Zero.

Queremos (a) o piso fiel à foto e (b) um puzzle de **alinhar planetas girando os anéis
concêntricos** desse mesmo disco — "piso bonito + puzzle em cima", o tabuleiro **é** o piso.

Restrições do domínio (PROJECT-CONSTITUTION §2):
- **§1** São exatamente **31 conchas em 9 cordões** — `TOTAL_PHASES` deriva de `DISTRICT_SIZES`.
- **§2** Todo puzzle entregue é **solúvel**.
- **§5** Tudo é desenhado por código — sem assets externos, sem dependências.

## Decisão

**(a) Piso fiel + helper compartilhado.** Criar **uma** função de desenho do disco em
`js/sprites.js` — `drawRosaDosVentos(ctx, cx, cy, r)` — que pinta anel externo (`#1d6fa3`),
miolo creme (`#f5efe0`) e a estrela de 8 pontas colorida (tokens da paleta). `SCENES[1].s`
substitui o stub de 3 retângulos por uma chamada a esse helper (grande, centrado na praça).

**(b) 11º motor.** Adicionar a classe **`OrbitPuzzle`** ("Alinhamento dos Planetas"), registrada
como `PUZZLES[11]` em `js/puzzles.js`, que **reusa** `drawRosaDosVentos` como tabuleiro. A fase
g=3 passa de `e: 9` → `e: 11` em `js/levels.js`; `engineCfg` ganha
`case 11: return { rings: 3 + tier }`; `PUZZLE_HINTS` ganha a entrada `11` em `js/story.js`.

Mecânica: N anéis concêntricos (órbitas) sobre a rosa dos ventos, cada um com um planeta numa de
**8 posições** (os 8 pontos da rosa dos ventos). Tocar um anel o gira um passo no sentido horário.
Quando **todos os planetas estão no Norte**, `solved = true`. Solubilidade é **por construção**
(cada anel é independente e qualquer alvo é alcançável em ≤7 toques) — não usa BFS, que se aplica
a geração procedural de labirintos/canos/rotas. Garantia anti-trivial: nenhum anel começa no Norte
→ a fase nunca abre já resolvida.

> **Reúso > duplicação:** `sprites.js` carrega antes de `puzzles.js` no `index.html`, então
> `OrbitPuzzle` enxerga `drawRosaDosVentos`. Uma única fonte de verdade da arte do disco
> (Mandato Crítico §3 — reusar helpers, não recriar).

## Alternativas consideradas

| Alternativa | Por que **não** |
|-------------|-----------------|
| **Reaproveitar o `MixerPuzzle` (reskin)** | Mecânica de sliders verticais é incompatível com girar anéis radiais; reskin seria gambiarra e contaminaria o engine 9, que segue em uso (Maré de Sizígia, Rainha Coroada). |
| **Criar uma 32ª fase nova** | Viola a Lei do Domínio §1 (31 conchas). Mexer em `DISTRICT_SIZES` quebra a progressão e o save. |
| **Reusar `SequencePuzzle` (acertar a ordem)** | Mecânica mais fraca para a sensação de "alinhar no chão"; o cliente escolheu girar anéis concêntricos. |
| **Engine 11 em várias fases (3–4×, como os demais)** | YAGNI. É um puzzle **assinatura** do Marco Zero; uso único é coerente e mais simples. O comentário "cada engine 3–4×" em `levels.js` é convenção, não lei — engine 5 (Maze) já é exceção (0 usos). |

## Consequências

**Positivas**

- O Marco Zero finalmente **parece** o Marco Zero (piso fiel à foto) e o puzzle combina com o
  lugar e a curiosidade (Cícero Dias).
- **DRY:** uma só `drawRosaDosVentos` serve cena e puzzle — coesão visual garantida.
- Motor isolado: a interface duck-typed (`tap`/`update`/`draw`/`solved`) e o registry `PUZZLES`
  absorvem o 11º sem tocar o fluxo de `main.js` (`new PUZZLES[L.engine](L.cfg)` já genérico).
- Mantém zero-dep, 100% desenhado por código, 31 conchas intactas.

**Negativas / riscos**

- Toca **4 arquivos JS** (`sprites.js`, `puzzles.js`, `levels.js`, `story.js`) — raio maior;
  mitigado por o helper do disco isolar a arte e o motor seguir o contrato dos 10 existentes.
- Engine 9 (Mixer) cai de 3 → 2 usos (aceitável; não é invariante).
- Acoplamento de ordem: `OrbitPuzzle` (em `puzzles.js`) depende de `drawRosaDosVentos` (em
  `sprites.js`) existir em runtime. **Não adiciona `<script>` novo** e `sprites.js` já carrega
  antes de `puzzles.js` no `index.html`, então a ordem frágil é preservada (Mandato Inviolável).

## Conformidade

- **FF-DOM-1** (puzzles solúveis): garantida por construção + teste manual via `window.__*`.
- **FF-DOM-2** (`TOTAL_PHASES = 31`): inalterada — sem mexer em `DISTRICT_SIZES`.
- **FF-002** (carrega sem erro de console): validar no navegador antes do deploy.
