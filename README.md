# Marés do Recife 🌊⛵

Jogo mobile em **pixel art** com **81 fases** (o DDD do Recife!) de **história e puzzles**,
todo ambientado no **Recife, Pernambuco**. Maju precisa recuperar as 81 contas do colar de
marés do avô jangadeiro antes do pôr do sol — 9 cordões, 9 contas em cada.

Feito em HTML5 + Canvas puro — sem dependências, sem imagens externas (toda a arte é
desenhada por código) e sem servidor de backend. Roda em qualquer navegador de celular.

## Os 9 cordões (81 fases)

| # | Cordão | Tema | Fase-âncora |
|---|--------|------|-------------|
| 1 | Dias de Sol | Marco Zero, Rua do Bom Jesus, Torre Malakoff... | Acender o casario |
| 2 | Beira-Mar | Boa Viagem, Piedade, arrecifes, Candeias | Memória + tubarão |
| 3 | Dias de Chuva | Inverno recifense, São João, Cais do Sertão | Canos da chuva |
| 4 | Coração de Mangue | Uçá, guaiamum, garças, maré de sizígia | Labirinto do uçá |
| 5 | Cultura Viva | Mercado de São José, tapioca, cordel, Vitalino | Tesouros & sombras |
| 6 | Noite dos Tambores | Maracatu, calunga, caboclinho, ciranda | Ritmo do baque |
| 7 | Fervo do Frevo | Galo da Madrugada, Paço do Frevo, o passo | Sequência de sombrinhas |
| 8 | Antenas do Mangue | Chico Science, Nação Zumbi, manguebeat | Equalizador |
| 9 | Maré 81 | Boi Voador, Perna Cabeluda, DDD 81, poente | Rota da jangada (fase 81) |

Cada cordão mistura os 10 motores de puzzle com dificuldade crescente e geração
procedural (labirintos, canos e rotas sempre solúveis — validados por BFS). Cada fase nova
traz uma curiosidade real do Recife; as fases-âncora têm diálogos completos com Maju e
Vovô Chico. O progresso fica salvo no aparelho (localStorage).

## Como jogar no celular

1. Sirva a pasta em um servidor local:
   ```bash
   npx http-server -p 8765 .
   ```
2. No celular (mesma rede Wi-Fi), abra `http://SEU_IP:8765`.
3. Ou publique a pasta em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel) —
   o `manifest.json` permite "Adicionar à tela inicial" como app (PWA).

## Estrutura

```
index.html        casca do jogo (canvas 360x640)
css/style.css     escala pixelada para a tela
js/audio.js       sons chiptune via WebAudio (tambores do maracatu inclusos)
js/sprites.js     pixel art procedural: personagens, ícones e os 10 cenários
js/story.js       roteiro principal (diálogos PT-BR) e dicas dos puzzles
js/levels.js      os 9 capítulos × 9 fases, curiosidades e dificuldade
js/puzzles.js     os 10 motores de puzzle parametrizáveis
js/main.js        máquina de estados, mapas, diálogos, toque e save
```
