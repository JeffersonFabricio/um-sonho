# Story — O encontro das Marias na igreja

> Modo: solo (sem `.discovery/` prévio) · Projeto: brownfield

## História

**Como** Maju, depois de reencontrar as duas avós em seus distritos,
**quero** que as duas Marias — a vovó viva e a vovó do céu — se encontrem numa igreja,
**para que** eu veja, num lugar sagrado, que o amor da família atravessa a vida e a morte.

## Contexto

A família carrega o nome **Maria** como um fio entre as gerações (já dito pela própria vovoMae: _"na nossa família, as meninas levam o nome de Maria no coração"_). As duas avós são:

- **Maria José** — paterna, **viva**, NPC `vova`, distrito 6 (Rua da Moeda / frevo).
- **Maria Rita** — materna, **no céu**, NPC `vovoMae`, distrito 7 (Beira do Mangue), figura etérea/luminosa.

Hoje elas vivem em distritos separados e nunca se cruzam. O cliente pediu: _"as marias poderiam se encontrar em uma igreja."_ Decisão de produto confirmada: **uma cena especial de reencontro**, disparada numa **igreja** posicionada na região das avós (**d6/d7**) — a viva e a do céu juntas num espaço sagrado, conversando sobre a Maju.

Já existe uma torre de igreja desenhada como decoração no Recife Antigo ([sprites.js:441](../../js/sprites.js#L441)); ela serve de base visual, mas a igreja do encontro é um **ponto interativo novo** na região d6/d7.

> ⚠️ Projeto profundamente afetivo (homenagem a uma sobrinha de vida muito breve). Esta é a cena mais delicada do jogo: a vovó do céu e a vovó da terra se encontram. O tom precisa ser amoroso, sereno e respeitoso — nada de drama nem de morte explícita; é reencontro, não despedida.

## Critérios de Aceite

1. Existe uma **igreja interativa** desenhada na região dos distritos das avós (d6/d7), reusando os helpers de desenho (sem asset externo).
2. A cena de reencontro só **dispara depois** que a Maju já conheceu **as duas avós** (`met.vova` **e** `met.vovoMae`); antes disso a igreja não inicia o reencontro (dá uma dica suave de que "ainda não é hora").
3. Ao disparar, a cena mostra **as duas Marias juntas** (Maria José viva e Maria Rita do céu) num diálogo onde ambas falam — com a Maju presente — e o nome **Maria** como fio da família é honrado.
4. Concluída a cena, ela é marcada como vista; tocar a igreja de novo mostra uma fala **curta de reencontro**, não a cena cheia.
5. A cena **não adiciona conchas/fases** — `TOTAL_PHASES` permanece **31** (é cena narrativa, não puzzle).
6. O jogo carrega sem erro de console; o save não regride (quem já viu a cena continua tendo visto após reload).

## Decisão sobre arquitetura

ADR necessário — introduz um **novo tipo de cena interativa** (igreja gatilho de cutscene), distinto dos nós de puzzle e dos NPCs comuns, com condição de desbloqueio narrativa. Ver [docs/adr/ADR-003-cena-reencontro-marias.md](../../docs/adr/ADR-003-cena-reencontro-marias.md). Blueprint do fluxo em [blueprint.mermaid](blueprint.mermaid) (mais de 2 passos com gating).
