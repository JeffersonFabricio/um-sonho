# Story — Marco Zero: piso da rosa dos ventos + puzzle de alinhamento

> Spec ID: `005-alinhamento-planetas` · Modo: solo (sem discovery prévio) · Projeto: brownfield

## História

**Como** Maju explorando o Marco Zero no Recife Antigo,
**quero** ver o grande disco da rosa dos ventos no chão da praça (igual ao Marco Zero de
verdade) e girar seus anéis até alinhar os planetas no Norte,
**para** ganhar a concha da fase "Rosa dos Ventos" num lugar que parece o quilômetro zero de
Pernambuco — o disco de Cícero Dias, fielmente desenhado.

## Contexto / motivação

O Marco Zero real (foto enviada pelo cliente) tem um **grande disco circular** no centro da
praça: anel externo azul-petróleo, miolo creme e uma **rosa dos ventos de 8 pontas colorida**
ao centro (obra de Cícero Dias). Hoje o jogo desenha só um **toco** disso — um quadrado de
60×60 com duas barrinhas cruzadas (`js/sprites.js` cena 1, linhas 879-883). E a fase
**"Rosa dos Ventos"** (g=3, cordão "Dias de Sol") roda o **engine 9 (Mixer / equalizador de
manguebeat)**, que não tem relação com o lugar.

Esta spec faz **duas coisas que viram uma só** ("piso bonito + puzzle em cima"):

1. **Piso fiel** — redesenha o chão da cena do Marco Zero como o grande disco circular real
   (anéis concêntricos + estrela de 8 pontas), via um helper de desenho **compartilhado**.
2. **Puzzle em cima** — a fase g=3 passa a usar o **11º motor**, `OrbitPuzzle`: o tabuleiro
   **é** esse mesmo disco; cada anel concêntrico carrega um planeta; tocar um anel o gira; quando
   **todos os planetas apontam para o Norte**, a concha é ganha.

Continuam **31 conchas** (Lei §1): g=3 troca `e: 9` → `e: 11`; o engine 9 segue em "Maré de
Sizígia" e "Rainha Coroada". **Sem fase nova.** A ordem dos `<script>` não muda (só edita
arquivos já carregados; `sprites.js` carrega antes de `puzzles.js`, então o puzzle pode reusar
o helper do disco).

## Critérios de Aceite

1. **AC1 — Piso fiel à foto:** a cena do Marco Zero (`SCENES[1]`) desenha um **grande disco
   circular** centrado na praça, com **raio ≥ 120px** (ocupa a maior parte da largura de 360px) —
   anel externo `--azul-passo` (`#1d6fa3`), miolo `--marfim` (`#f5efe0`) e rosa dos ventos de 8
   pontas colorida (tokens `--ouro #f2c038`, `--vermelho-perigo #d94f4f`, `--azul-passo #5b8bd9`,
   `--verde-mangue #67b06b`, `--lilas-festa #c97bb6`), no lugar do stub de 3 retângulos.
   Desenhado 100% por código, sem asset externo.
2. **AC2 — Helper compartilhado (DRY):** existe **uma** função de desenho do disco em
   `js/sprites.js` (ex.: `drawRosaDosVentos(ctx, cx, cy, r)`) reusada **tanto** pela cena
   **quanto** pelo `OrbitPuzzle` — sem duplicar a arte do disco em dois lugares.
3. **AC2.5 — Motor registrado e isolado:** existe `OrbitPuzzle` como `PUZZLES[11]`;
   `new PUZZLES[11]({ rings: 3 })` não lança e expõe `tap`, `update`, `draw`, flag `solved`.
4. **AC3 — Nunca inicia resolvido / sempre solúvel:** ao abrir, nenhum anel começa no Norte
   (`solved === false`); o alvo é sempre alcançável girando cada anel em passos discretos
   (8 posições da rosa dos ventos) — solubilidade **por construção**, sem deadlock.
5. **AC4 — Girar uma órbita por toque resolve:** tocar sobre um anel gira **apenas** aquele anel
   um passo; tocar fora não faz nada; quando **todos** os planetas chegam ao Norte, `solved` vira
   `true`, toca `AudioFX.win()`, e ao concluir a fase `done[3]` é marcado e salvo (Lei §4 — nunca
   regride).
6. **AC5 — Fiel ao Recife e zero-dep:** dica em PT-BR (`PUZZLE_HINTS[11]`), curiosidade da fase
   mantida (Cícero Dias / Marco Zero), nenhuma dependência nova, nenhum hex fora da paleta de
   `DESIGN.md`, e o jogo carrega sem erro de console (FF-002).

## Arquitetura

- **ADR-004** (`docs/adr/ADR-004-motor-alinhamento-planetas.md`) — decisão de (a) adicionar um
  11º motor em vez de reaproveitar o Mixer / criar 32ª fase, e (b) compartilhar o desenho do
  disco entre cena e puzzle. Toca **4 arquivos JS** (`sprites.js`, `puzzles.js`, `levels.js`,
  `story.js`) → ADR exigido pelo Acordo §6.
- **Blueprint** (`blueprint.mermaid`) — estado do motor (embaralhar → girar → alinhado).
