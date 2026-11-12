# Livro de Regras Vila Carioca

Site estático com o livro de regras dos jogadores da Vila Carioca, no mesmo visual dos sites de denúncias e de regras da staff (preto, branco e vermelho). Tem índice lateral agrupado (Introdução, Regras e Ações) que acompanha a leitura, busca em todas as regras com os termos marcados e layout para celular.

O texto segue o GitBook original dos players: introdução, Monitoramento e produção de provas, capítulos 1 a 24, Regra de ações e as regras de cada ação (Caixa Eletrônico, Caixa Registradora, Caminhão Cegonha, Joalheria, Banco de Paleto, Nióbio e Assalto a cidadãos). Duas diferenças em relação ao GitBook: denúncias e reports de bugs são feitos pelo ticket (regra 4 do Discord), e o acesso policial ao celular é pedido pelo comando da Polícia (regra 5 do Celular), em vez de citar personagens.

## Editar

- Textos das regras: direto em `index.html`. Cada capítulo é uma `<section class="chapter">`; cada regra numerada é um `<li>` dentro de `<ol class="rules">`; os dados de cada ação ficam em `<dl class="specs">`.
- Para um capítulo novo, crie a `<section>` e adicione o link no índice (`<nav class="toc">`).
- Cores e aparência: `css/estilo.css`.
- Busca e índice: `js/regras.js`.
- Imagens: `assets/` (logo e perímetro do Banco de Paleto).

## Publicar

Envie a pasta inteira (com o `index.html` na raiz) para a Netlify, o Cloudflare Pages, a Vercel ou o GitHub Pages. Não há build.
