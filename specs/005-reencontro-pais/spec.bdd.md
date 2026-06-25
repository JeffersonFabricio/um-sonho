# Spec BDD — O reencontro dos pais no Cais

> Feature: `005-reencontro-pais` · Story: [story.md](story.md) · ADR: [ADR-006](../../docs/adr/ADR-006-reencontro-pais-cais.md) · Blueprint: [blueprint.mermaid](blueprint.mermaid)
> Arquitetura: elenco em fonte única `js/characters.js` (ADR-005). `osPais` é **uma** entrada no registro; `NPCS`/`SPEAKERS`/`WORLD_NPCS`/`NPC_DRAW` derivam dela.
> Validação: manual no navegador via `window.__*` (sem framework de teste — baseline brownfield). Roteiros concretos no fim do arquivo.

```gherkin
Funcionalidade: Reencontro dos pais (Jonatha + Micaele) no Cais da Alfândega (d8)
  Para que, no fim da jornada, a família que despediu a Maju na abertura
  esteja no cais pra vê-la chegar, os dois pais aparecem juntos num ponto
  interativo do distrito final — sem somar concha e sem tocar no desfecho.

  Contexto:
    Dado que o elenco é projetado do registro único Characters (js/characters.js)
    E que existe uma entrada "osPais" em CHARACTERS com d:8, free e world

  # --- Parte 1: abertura (d0) — Jonatha ao lado da Micaele ---

  Cenário: Jonatha nasce adjacente à Micaele na abertura
    Quando o mundo é carregado no distrito 0 (Recife Antigo)
    Então no mundo livre (NPCS, posição free) "jona" e "mica" já são simétricos
      (mesma linha, lados opostos do centro do distrito)
    E no passeio (WORLD_NPCS, posição world) "jona" fica num tile adjacente ao da "mica"
      (distância de Chebyshev ≤ 2 tiles em col/row, mesmo distrito d:0)
    E nenhuma das duas posições coincide com um nó de concha

  Esquema do Cenário: A ordem do onboarding (Micaele → Jonatha) não muda
    Dado que "met.mica" é <mica> e "briefed" é <briefed>
    Quando a Maju toca o Jonatha na abertura
    Então o comportamento é <resultado>
    E nenhum estado de save é gravado de forma diferente da spec 001

    Exemplos:
      | mica  | briefed | resultado                                                       |
      | false | false   | desvio jonaBlocked ("fala primeiro com tua mãe"); não marca nada |
      | true  | false   | explica a missão; marca briefed=true e met.jona=true            |
      | true  | true    | fala curta jonaAgain; nada é reescrito no save                  |

  # --- Parte 2: o ponto dos pais no Cais (d8) ---

  Cenário: Pais registrados como cena, derivados do registro único
    Quando o mundo é carregado
    Então Characters.npcs() contém "osPais" (entra no mundo livre, é tocável via talkNpc)
    E Characters.worldNpcs() contém "osPais" no distrito 8 (Cais)
    E NPC_DRAW["osPais"] é uma função (desenho por código, sem Image/asset)
    E "osPais" NÃO aparece em PHASE_NODES
    E "osPais" NÃO tem a flag ending (não dispara o desfecho)
    E o tile de "osPais" não coincide com o de nenhum nó de concha nem com o do Vovô Maro

  Cenário: O ponto dos pais é alcançável pela interação real (não só por bypass)
    Dado que o distrito 8 está desbloqueado
    Quando a Maju caminha até ficar próxima dos pais
    Então o prompt "★ FALAR" aparece (S.nearNpc resolve para "osPais")
    E acionar o prompt abre o diálogo dos pais

  Cenário: Reencontro dispara ao tocar os pais pela primeira vez
    Dado que o distrito 8 está desbloqueado
    E que "met.osPais" é falsy
    Quando a Maju toca os pais
    Então é exibido STORY.meet.osPais (cena cheia)
    E há ao menos uma fala atribuída a "jona" e ao menos uma a "mica" (os dois pais falam)
    E há ao menos uma fala de "maju" na cena
    E ao concluir o diálogo, "met.osPais" passa a ser verdadeiro

  Cenário: A cena ecoa as lições dos pais (coragem + fé)
    Quando STORY.meet.osPais é inspecionado
    Então ao menos uma fala de "jona" remete à coragem (ex.: "valente"/"coragem")
    E ao menos uma fala de "mica" remete à fé/cuidado (ex.: "fé")

  Cenário: Reencontro já visto mostra a fala curta
    Dado que "met.osPais" é verdadeiro
    Quando a Maju toca os pais de novo
    Então é exibido STORY.meet.osPaisAgain (curta), não STORY.meet.osPais (cheia)

  Cenário: A cena não menciona morte (tom de reencontro afetivo)
    Quando STORY.meet.osPais e STORY.meet.osPaisAgain são inspecionados
    Então nenhuma fala contém "morte", "morrer", "morreu", "faleceu", "partiu" ou "despedida"

  # --- invariantes do desfecho e da Lei do Domínio ---

  Cenário: A cena não adiciona conchas
    Quando os pais são adicionados ao registro
    Então TOTAL_PHASES permanece 31
    E PHASE_NODES não ganha nenhum nó por causa dos pais

  Cenário: A cena dos pais não altera o desfecho (clímax ortogonal)
    Dado que o distrito 8 está desbloqueado
    E que "met.vovo" tem um valor V antes da interação
    Quando a Maju toca os pais (osPais)
    Então o fluxo do Vovô Maro NÃO é disparado (startEnding não é chamado)
    E o skyEnding NÃO é iniciado
    E "met.vovo" continua igual a V após a cena dos pais
    E falar com o Vovô Maro depois continua funcionando como antes (desfecho intacto)

  Cenário: Save da cena vista não regride após reload
    Dado um save v3 cujo "met" contém { osPais: true }
    Quando o jogo é recarregado (parseSave)
    Então "met.osPais" continua verdadeiro
    E a Maju vê a fala curta (osPaisAgain) ao tocar os pais

  Esquema do Cenário: Save com met ausente/malformado não trava (load defensivo)
    Dado um save v3 cujo "met" é <met>
    Quando o jogo carrega esse save
    Então o jogo carrega sem erro de console
    E "met.osPais" é falsy
    E tocar os pais (com d8 desbloqueado) dispara a cena cheia normalmente

    Exemplos:
      | met                          |
      | {} (sem osPais)              |
      | null                         |
      | 42 (primitivo, não-objeto)   |
      | "estado" (string)            |

  Cenário: O load defensivo não corrompe os marcadores do onboarding
    Dado um save v3 válido com met.mica, met.jona e briefed verdadeiros
    Quando o jogo carrega após a reposição do "jona" desta feature
    Então met.mica, met.jona e briefed permanecem verdadeiros (onboarding não regride)

  Cenário: Pais inacessíveis enquanto o Cais (d8) está na névoa
    Dado que o distrito 8 ainda não está desbloqueado
    Então o tile dos pais está coberto pela névoa
    E a Maju não consegue alcançá-lo até desbloquear o distrito final

  Cenário: Jogo carrega e desenha os pais sem exceção
    Quando o index.html é aberto no navegador
    Então não há erro no console
    E drawPais está definida (em sprites.js) antes de characters.js referenciá-la
    E os dois pais (Jonatha + Micaele) são desenhados lado a lado sem lançar
    E a abertura (d0) desenha o Jonatha ao lado da Micaele sem lançar
```

## Roteiro de validação manual (via `window.__*`)

```js
const k = 'maresRecife:pernambuco-meu-pais';

// --- Parte 1: abertura (posição no passeio/world) ---
const wn = window.__world.worldNpcs;                       // projeção de Characters.worldNpcs()
const mica = wn.find(n => n.key === 'mica'), jona = wn.find(n => n.key === 'jona');
Math.max(Math.abs(mica.col - jona.col), Math.abs(mica.row - jona.row)) <= 2;   // true (adjacentes)
// mundo livre (free): jona e mica já são simétricos — confira via Characters.all.jona.free / .mica.free

// --- Parte 2: cena no cais ---
window.__world.npcs.find(n => n.key === 'osPais');         // NÃO deve ser null (osPais entrou em NPCS)
window.__world.completeAll();                              // desbloqueia o d8 ao vivo (districtDone lê S.save.done) — sem reload
window.__game.save.met.osPais = false;                     // só nesta sessão (não persiste; não chama save())
window.__world.toNpc('osPais');                            // teleporta a Maju pro lado dos pais
window.__world.talk('osPais');                             // 1ª vez → STORY.meet.osPais (cheia); ao fim, met.osPais=true
window.__world.talk('osPais');                             // 2ª vez → STORY.meet.osPaisAgain (curta)

// clímax intocado: tocar os pais não mexe em met.vovo nem dispara o final
const v = window.__game.save.met.vovo; window.__world.talk('osPais'); window.__game.save.met.vovo === v; // true

// persistência (via localStorage, que persiste de verdade):
const s = JSON.parse(localStorage.getItem(k)); s.met.osPais = true; localStorage.setItem(k, JSON.stringify(s));
location.reload();   // pós: window.__game.save.met.osPais === true; talk('osPais') → osPaisAgain

// load defensivo agressivo: met primitivo + d8 bloqueado
const s2 = JSON.parse(localStorage.getItem(k)); s2.met = 42; localStorage.setItem(k, JSON.stringify(s2));
location.reload();   // pós: console limpo; met.osPais falsy

// grep de tom (sem morte) + lições:
const ls = [...(STORY.meet.osPais||[]), ...(STORY.meet.osPaisAgain||[])];
['morte','morrer','morreu','faleceu','partiu','despedida'].some(w => ls.some(l => l.text.toLowerCase().includes(w))); // false
TOTAL_PHASES === 31;  // true
```

> Hooks confirmados no código: `window.__world` (main.js:1382) expõe `npcs`, `worldNpcs`, `toNpc`, `talk`, `completeAll`. O `talkNpc` (main.js:880-912) trata `met[key]→Again` e grava `met[key]=true` ao concluir — `osPais` herda esse caminho desde que esteja em `NPCS` (via `free` no registro). A posição exata do tile dos pais no cais fica a definir no `/implement` (ADR-006).

## Notas de implementação (não-normativas)

- **`js/characters.js` (edição principal, fonte única — ADR-005):** adicionar **uma** entrada `osPais` a `CHARACTERS`, espelhando o `vovo`:
  `osPais: { name: 'PAINHO E MAINHA', color: '#3fae7a', draw: drawPais, d: 8, lesson: 'Coragem do painho e fé da mainha caminham com você.' (opcional), free: { dx, dy }, world: { col, row, label: 'PAINHO E MAINHA' } }`.
  `NPCS`/`SPEAKERS`/`WORLD_NPCS`/`NPC_DRAW` herdam automaticamente — **não editar world3d.js nem main.js para registrar o NPC**. Ajustar o `world` de `jona` (hoje `col:8,row:9`) pra perto do `world` de `mica` (`col:3,row:6`); o `free` já é simétrico.
- **`js/sprites.js`:** novo `drawPais(ctx, x, y, s = U)` reusando `drawJonatha` + `drawMicaele` lado a lado, no molde de `drawPrimos` (sprites.js:308). **Em `sprites.js`** porque carrega antes de `characters.js` (FF-002 / ADR-006).
- **`js/story.js`:** `STORY.meet.osPais` (cena cheia: `nar`/`jona`/`mica`/`maju`) + `osPaisAgain` (curta). Draft das falas na [story.md](story.md).
- **`js/main.js` provavelmente intacto:** `talkNpc` (main.js:880) é genérico. Confirmar que `osPais` (sem flag `ending`) **não** cai no caso `npc.key === 'vovo'` (884) nem em `startEnding` (881).
- **Revisão editorial (humano):** tom amoroso/orgulhoso/sereno é item de Definição de Pronto (ver story.md) — o cenário automatizável cobre apenas ausência de palavras de morte e presença das lições.
