# Story — O reencontro dos pais no Cais

> Modo: solo (sem `.discovery/` prévio) · Projeto: brownfield · Padrão herdado de [ADR-003](../../docs/adr/ADR-003-cena-reencontro-marias.md) · Registro único de elenco: [ADR-005](../../docs/adr/ADR-005-registro-unico-elenco.md)

## História

**Como** Maju, depois de atravessar quase o Recife inteiro atrás das conchas,
**quero** reencontrar meu painho (Jonatha) e minha mainha (Micaele) juntos no Cais da Alfândega,
**para** que, no fim da jornada, a família que me despediu na abertura esteja lá pra me ver chegar — coragem e fé renovadas antes da última maré.

## Contexto

Jonatha e Micaele **abrem o mundo** no Recife Antigo (d0): a Micaele recebe a Maju, o Jonatha explica a missão do colar e libera a cidade (onboarding gated — spec 001). Lições da abertura:
- **Jonatha** → coragem ("já nasceu valente")
- **Micaele** → fé e cuidado ("vai com fé")

Depois disso, hoje, **os pais nunca mais aparecem de forma interativa** — só são citados de relance no `skyEnding`. O cliente pediu duas coisas:

1. Que **Jonatha inicie o mundo posicionado ao lado da Micaele** (a abertura mostra os dois pais juntos no spawn) — **sem mexer** na ordem obrigatória do onboarding (Micaele → Jonatha) da spec 001.
2. Que os pais **reapareçam uma segunda vez, de forma interativa, numa fase posterior** — decisão de produto confirmada: **no Cais da Alfândega (distrito 8, o final)**, junto do território do Vovô Maro.

> 📐 **Nota de arquitetura (registro único — ADR-005):** o elenco vive numa fonte única em [`js/characters.js`](../../js/characters.js); `NPCS`/`SPEAKERS`/`WORLD_NPCS`/`NPC_DRAW` são projeções dela. Cada personagem tem posição por-view: `free` (mundo livre, onde o `talkNpc` opera) e `world` (passeio final). Hoje, no `free`, `jona` (`dx:-52`) e `mica` (`dx:+52`, mesma linha) **já são simétricos/adjacentes**; no `world`, estão distantes (`col:8,row:9` vs `col:3,row:6`). A Parte 1 alinha as **duas** vistas pra garantir os pais lado a lado em qualquer renderização. A Parte 2 adiciona **uma só entrada** `osPais` ao registro (espelhando o `vovo`: `d:8` + `free` + `world`).

O **Cais (d8)** é o único lugar onde a família se completa de novo: a jornada **abre** com os pais (d0) e os reencontra **onde ela termina** (d8). Como os distritos desbloqueiam em sequência, chegar ao d8 significa que a Maju já percorreu quase tudo (g1–28) — o reencontro vira a **parada de fôlego** antes da última maré: "olha quanto chão tu andou, filha".

> ⚠️ Projeto profundamente afetivo (homenagem a uma sobrinha de vida muito breve). Tom **terno, orgulhoso, sereno** — reencontro de amor, **sem drama e sem morte**. Mesmo guardrail editorial da 004.

### Diálogo proposto (draft para revisão humana — vai em `js/story.js`)

`STORY.meet.osPais` (cena cheia):

```
nar:  O sol começa a se deitar no Cais da Alfândega. Entre as jangadas, dois rostos conhecidos esperam.
mica: Maju! Minha filha... olha só quanto chão tu andou!
maju: Painho! Mainha! Vocês vieram!
jona: Viemos, sim. A gente te viu de longe, atravessando o Recife inteiro.
mica: Sol, mar, chuva, mangue, tambor, frevo... tu passou por tudo, meu amor.
maju: Teve hora que cansei, mainha. Achei que não ia dar conta.
jona: Mas deu. Tu já nasceu valente, filha — a coragem tava em ti desde o começo.
mica: E o resto a fé carrega. A gente nunca soltou tua mão, mesmo de longe.
maju: Eu senti vocês comigo o tempo todo.
jona: Falta pouco agora. O vovô Maro te espera ali na ponta do cais, com a última maré.
mica: Vai, minha Maju. A gente fica bem aqui, te vendo chegar.
maju: Quando o colar tiver inteiro, eu volto pro abraço de vocês!
nar:  Jonatha e Micaele acenam. O cais inteiro parece sorrir com a Maju.
```

`STORY.meet.osPaisAgain` (fala curta de reencontro):

```
mica: Tamo aqui, filha. Vai pegar o resto, que a gente te espera.
jona: Coragem e fé, Maju. Já já tu volta com o colar inteiro.
maju: Já tô indo! Amo vocês!
```

## Critérios de Aceite

1. Na **abertura (d0)**, Jonatha nasce **adjacente** à Micaele (distância de Chebyshev ≤ 2 tiles na vista `world`; já simétrico na vista `free`); a ordem obrigatória do onboarding (Micaele primeiro, Jonatha libera a seta — spec 001) **continua valendo** sem alteração de lógica de estado.
2. Existe um **ponto interativo novo dos pais** (`osPais`) desenhado por código no Cais da Alfândega (d8), reusando os sprites de Jonatha e Micaele lado a lado (sem asset externo).
3. Ao tocar os pais no cais pela 1ª vez (`!met.osPais`), exibe-se a **cena cheia** `STORY.meet.osPais`, onde **os dois falam** (`jona` e `mica`) com a **Maju** presente; ao concluir, `met.osPais` passa a verdadeiro.
4. Tocar os pais de novo (`met.osPais` verdadeiro) exibe a **fala curta** `STORY.meet.osPaisAgain`, não a cena cheia.
5. A cena **não adiciona conchas/fases** — `TOTAL_PHASES` permanece **31**; `osPais` **não** entra em `PHASE_NODES`.
6. A cena dos pais **não altera o desfecho**: tocar os pais (`talk('osPais')`) **não chama `startEnding`** e **não altera `met.vovo`**; o fluxo do Vovô Maro e o `skyEnding` (e o passeio 3D no céu) continuam funcionando como antes — a cena dos pais é ortogonal ao final.
7. O jogo **carrega sem erro de console** (FF-002) em qualquer estado de save; o save **não regride** (quem já viu a cena continua tendo visto após reload), e a reposição do `jona` não corrompe `met.mica`/`met.jona`/`briefed`.

## Definição de Pronto (além dos ACs)

- **Revisão editorial humana do diálogo aprovada** — o tom amoroso/orgulhoso/sereno (coragem do painho + fé da mainha, "olha quanto chão tu andou", sem morte) é critério obrigatório de aceite, não só de revisão de código.
- `drawPais` **reutiliza** `drawJonatha`/`drawMicaele` (não redesenha sprite do zero) — critério de revisão de código.

## Decisão sobre arquitetura

ADR necessário — segunda instância do padrão "cena interativa gatilhada por local" (ADR-003), agora **no distrito do desfecho (d8)**, exigindo a invariante de **não poluir o clímax** (Vovô Maro / skyEnding), e implementada via o **registro único de elenco** (ADR-005). Ver [docs/adr/ADR-006-reencontro-pais-cais.md](../../docs/adr/ADR-006-reencontro-pais-cais.md). Fluxo com gating em [blueprint.mermaid](blueprint.mermaid).
