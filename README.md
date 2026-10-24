# Site · Joyce Avila, Nutricionista

Este é um site de uma página só. Ele é feito com HTML, CSS e JavaScript puros, sem dependências nem etapa de build.

## Conceito: "Folha de ouro" (v2)

A primeira versão tinha pérolas. A pedido do cliente, elas saíram e o site ficou mais chique e mais fino, numa linha editorial de luxo. A assinatura agora é o **anel de folha de ouro** que aparece nos posts dela (`js/ouro.js`):

- **Abertura:** o anel é pintado em folha de ouro enquanto o contador vai de 0 a 100%. Depois o monograma JA se escreve no centro, o nome aparece e a tela sobe.
- **Hero:** há dois anéis em volta da foto, um atrás e um na frente. O mouse funciona como luz, e o brilho do ouro corre pelo anel na direção do cursor. As lâminas se soltam quando o mouse passa perto e voltam ao lugar; um clique sopra as lâminas.
- **Reconhecimento e Contato:** fundo vinho com anéis de ouro, que se pintam quando a seção aparece e reagem ao mouse do mesmo jeito.
- **Temas:** índice editorial (01 Granola, 02 Pressão…). A palavra aparece repetida três vezes, com contorno dourado, e as cópias se afastam com o mouse.
- **Como funciona:** um fio dourado se desenha com a rolagem, com marcos em losango que acendem.

**Animações de rolagem** (em `js/main.js`, desligadas quando o sistema pede movimento reduzido):

- **Títulos:** sobem palavra por palavra, saindo de uma máscara.
- **Fotos:** abrem como uma cortina, com leve zoom e paralaxe.
- **Molduras e filetes de ouro:** se desenham ao aparecer na tela.
- **Listas, FAQ e passos:** entram em cascata.
- **Faixa editorial:** depois do hero, desliza para os lados conforme a rolagem.
- **Topo:** uma barra dourada mostra o progresso da leitura, e o menu se esconde ao descer e volta ao subir.

Paleta: marfim, champanhe, vinho e ouro. Fontes: Bodoni Moda (títulos, com o eixo óptico baixo para deixar os traços finos mais visíveis) e Jost 400/500 (texto). Os botões têm cantos retos e filetes finos.

## Estrutura

```
index.html          página
css/styles.css      todo o visual (tokens no topo, em :root)
js/config.js        WhatsApp, Instagram, CRN, prêmio  ← o que mais muda
js/ouro.js          anéis de folha de ouro + animação de abertura
js/main.js          menu, temas, fio dos passos, posição dos anéis
assets/img/         fotos
assets/favicon.svg  ícone da aba
qa/                 scripts e prints de teste (não publicar)
_originais/         imagens extraídas do PDF (não publicar)
```

## Como alterar

- **WhatsApp, Instagram, CRN e mensagem padrão:** edite `js/config.js`. Todos os botões com `data-wa` usam esse número.
- **Prêmio:** em `js/config.js` → `premio`. Preencha `fonte` com o nome e o ano da premiação, e a linha aparece sozinha.
- **Fotos:** substitua o arquivo em `assets/img/` mantendo o mesmo nome. Se a foto faltar, aparece um placeholder listrado com o nome do arquivo esperado.
- **Temas da seção "Isso ninguém te conta":** cada botão em `index.html` tem `data-eco` (a palavra repetida) e `data-frase`. O trecho entre `|barras|` fica em rosa.
- **Logo:** o monograma JA é o `<symbol id="mono">` no topo do `index.html`. A abertura tem uma cópia em linha, para conseguir animar o traço.
- **Domínio:** troque `joyceavila.felixdias.com` em `index.html`, `robots.txt` e `sitemap.xml`.

**Depois de qualquer mudança em CSS ou JS, troque o `?v=` dos links no `index.html`** (ex.: `?v=20261023c` → `?v=20261024a`). Sem isso, o navegador mostra a versão antiga.

## Publicar

Suba a pasta inteira, **sem** `qa/`, `_originais/`, `README.md` e `PENDENCIAS.md`, em qualquer hospedagem estática (GitHub Pages, Hostinger, Netlify). Não há comando de build.

## Testes

Os prints em 1440, 1024, 768, 390 e 360 px são gerados com:

```
node qa/shots.cjs            # todos
node qa/shots.cjs 1440,390   # só alguns
```

O script usa o Playwright da skill e o Chrome instalado.

## Decisões

- **Movimento reduzido:** quando o sistema pede `prefers-reduced-motion`, a abertura fica curta e o ouro fica parado.
- **Desempenho:** os anéis só são animados enquanto estão visíveis (IntersectionObserver), e cada lâmina é um polígono simples desenhado no canvas.
- **Regras do CFN:** não há antes/depois, garantia de resultado, preço promocional nem depoimentos inventados. O CRN está visível, e o rodapé declara o uso de IA.
