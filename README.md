# Character Select — MapaDev Week

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

Seleção de personagens estilo arcade (inspirado em telas de *character select*), feito no **MapaDev Week** com HTML, CSS e JavaScript puro.

> Passe o mouse sobre um herói ou vilão e veja a arte e o nome grandes atualizarem na hora.

**Demo online:** [denispaulo.github.io/projeto-mapadev-week](https://denispaulo.github.io/projeto-mapadev-week/)

## Demo

Abra o `index.html` no navegador (ou sirva a pasta com um servidor estático).

```bash
# opcional — servidor local simples
npx --yes serve .
```

## O que o projeto faz

- Lista de personagens com hover / seleção visual
- Troca dinâmica da imagem e do nome do personagem grande (jogador 1)
- Layout responsivo, animações e tipografia customizada
- Organização em pastas: `css`, `js`, `imagens`, `fontes`

### Personagens

Thor, Homem de Ferro, Viúva Negra, Hulk, Capitão América, Ultron, Doutor Doom, Fênix, Nova

## Como rodar

1. Clone o repositório:

```bash
git clone https://github.com/DenisPaulo/projeto-mapadev-week.git
cd projeto-mapadev-week
```

2. Abra `index.html` no navegador **ou** use um servidor estático na pasta do projeto.

## Estrutura

```
projeto-mapadev-week/
├── index.html
└── src/
    ├── css/          # variáveis, reset, estilos, animações, responsivo, fontes
    ├── js/           # lógica de seleção (hover)
    ├── imagens/      # artes .jpg / .png dos personagens
    └── fontes/       # tipografia do layout
```

## Aprendizados

- Manipulação do DOM com `querySelector` / `querySelectorAll`
- Eventos de `mouseenter`
- CSS com variáveis, animações e media queries
- Separação de responsabilidades em arquivos

## Licença

Distribuído sob a licença [MIT](LICENSE).

---

Feito por [Denis Paulo](https://github.com/DenisPaulo) · projeto do MapaDev Week
