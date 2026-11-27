# Wilton Rocha Hidrogeologia — gerador de laudos hidrogeológicos

## O que é
Página web (um único index.html, sem servidor) para o geólogo Wilton Rocha (sogro do usuário, Alagoas) preencher abas e gerar o "Laudo hidrogeológico para outorga de direito de uso de recursos hídricos" em **Word editável (.docx)** ou **PDF**. As partes fixas do laudo são textos-modelo; só as partes que mudam de poço para poço (marcadas em amarelo no laudo de exemplo, `in/estudo.doc`) são campos.
Uso alvo: **notebook/desktop**. O usuário fala português; interface, textos e respostas em português do Brasil.

## Estado atual (rodada 2 de melhorias, nov/2026)
- Abas: Início, Meus laudos (pastas por cliente), Tabelas de apoio, Configurações, Dados gerais, Localização, Poço e teste, Geologia, Cálculos, Demanda e interferência, Vulnerabilidade, Qualidade da água, Textos-base, Gerar relatório. Painel "Resumo ao vivo" à direita.
- **Importar ficha do teste** (aba Poço e teste / atalho no Início): PDF da GEOTECH lido com pdf.js (`src/teste.js` `pdfLines` + `parseFicha`), análise por etapa (Jacob, Theis, Hantush, `analisarTeste`), tela de conferência com caixas de seleção antes de aplicar. Também aceita .txt/.csv.
- **Fichas escaneadas** (foto, ex.: WX Poços, poço MBR-05): caixa "Digite ou cole as leituras" na importação (`HL.parseLeituras`): tempo em min ou h:mm, ND, vazão opcional; L/h com milhar ("2.500"); "Etapa N" separa etapas. Sem OCR de propósito (erro em tabela escaneada estraga o laudo). Teste de etapa única ajusta os textos (`tipoTeste`, `escalonado`).
- **Ctrl+V** de tabelas (Quadro 01, coluna T do Quadro 02, litoestratigrafia, campos em sequência) e de coordenadas inteiras (`09°35'05,58"S 35°45'52,94"W`).
- Quadro 02: K = T ÷ espessura (automático), média por método e **média geral = média das médias** (confere com JCC-01). Sem dado = célula em branco.
- Tabelas do laudo com células mescladas (`HL.tableGrid`, `headRows` para cabeçalho de 2 linhas, `shade` para célula cinza), iguais na prévia, no Word e no PDF; tabelas não se dividem entre páginas.
- Furo e filtro (Qmpfr, Qmpf) quando há perfil construtivo; % do Rd no texto; numeração automática das equações.
- GOD pelo diagrama de Foster et al. (2002) enviado pelo geólogo (D: <5 0,9; 5–20 0,8; 20–50 0,7; >50 0,6). D em branco = automático pela tabela.
- Persistência: **IndexedDB** (`hidrolaudo` / chave `hidrolaudo:v1`; cai para localStorage) + backup automático opcional num arquivo `hidrolaudo-backup.json` numa pasta escolhida (File System Access API, Chrome/Edge) + exportar/importar JSON.
- Memória de dados (`store.memo`): campos em `MEMO` viram sugestões (datalist); campos em `CARRY` vêm preenchidos no laudo novo com o último valor. Tela Configurações mostra e permite esquecer.
- Downloads: janela "Salvar como" (`showSaveFilePicker`), senão download comum.
- Responsável padrão: Wilton José Silva da Rocha, Hidrogeólogo, CONFEA 180617525-8.
- Regras técnicas detalhadas na skill `.claude/skills/hidrogeologia-laudos/SKILL.md`.

## Estrutura
- `shell.html` — esqueleto (placeholders `@@CSS@@`, `@@JS@@`, `@@PDFLIB@@`, `@@PDFJS@@`, `@@PDFJSWORKER@@`, `@@IMG_*@@`)
- `src/calc.js` (cálculos), `teste.js` (ficha e análise do teste), `report.js` (textos + blocos + exemplo CMV-01 + `tableGrid`), `docx.js`, `pdf.js`, `ui.js` (telas), `ui.css`
- `node build.js` → `out/index.html` (≈2,7 MB, tudo embutido, funciona sem internet) e cópia em `../Wilton Rocha - Laudos.html`.
- Dependências (só para build/testes): `npm install` (pdf-lib 1.17.1, pdfjs-dist 3.11.174, playwright).
- Testes: `node test_node.js` (cálculos conferidos com o JCC-01 + gera Word/PDF em out/), `node test_ficha.js "ficha.pdf"` (leitura e análise), `node e2e.js "ficha.pdf"` (navegador Edge via Playwright: importação, colar, pastas, downloads, persistência).
- `in/estudo.doc|docx` — laudo CMV-01; `paras.txt` — parágrafos com os trechos amarelos. O modelo completo é o JCC-01 (PDF do usuário, fora da pasta).

## Decisões do geólogo
- Divergências numéricas do laudo JCC-01 eram erros do documento: **seguir sempre as fórmulas (doutrina)**, nunca copiar números de laudos antigos. Detalhes na skill.
- Qualidade da água aceita um ou dois certificados (físico-química e bacteriológica).
- Ícones: SVG de linha no próprio código (não gerar no ChatGPT). Imagens: banner, logo e rodapé do menu (`assets/sidebar.webp`, recortado de `assets/sidebar_original.jpg`).
## Próximos passos sugeridos
- Ler fichas de outras empresas (mandar exemplos) e planilhas .xlsx.
- Perfil construtivo/litológico importado do relatório técnico.
- Hospedagem e login, se mais de uma pessoa for usar.
## Imagens e ícones: como pedir ao usuário (ele gera em outra IA)
Você (Claude Code) não gera imagens. Quando o app precisar de imagem, ícone, ilustração ou foto, **escreva o prompt pronto** para o usuário colar no ChatGPT (ou outra IA de imagem) e peça que ele salve o arquivo em `assets/`. Depois, abra o arquivo, encaixe no app (embutido em base64 pelo `build.js`, como os atuais) e rode os testes.

Regras para os prompts:
- Em português, direto, um prompt por imagem, em bloco de código para copiar fácil.
- **Sempre sem texto, letras ou logotipo na imagem**: títulos e rótulos são colocados pelo app em HTML.
- Informar formato/proporção (ChatGPT gera melhor em quadrado 1:1 ou paisagem 1536×1024; para faixas largas, pedir paisagem e cortar depois), fundo (sólido azul-marinho #0a2238 ou transparente) e estilo.
- Paleta fixa: azul-marinho #0a2238, dourado #c8923b / #e8bd6a, creme #efe9db, azul-água turquesa.
- Estilo: sóbrio e profissional; ilustrações em vetor plano ou realista com acabamento de pintura digital; luz quente de fim de tarde no banner.
- Para ícones: pedir conjunto coerente (mesma espessura de linha, contorno dourado, fundo transparente ou azul-marinho), de preferência em PNG grande, um por vez.
- Dizer ao usuário o tamanho em que a imagem será exibida e se o app vai cortá-la (`object-fit: cover`), para ele manter o assunto importante no centro.
- Se a imagem vier com fundo sólido, remova o fundo por chaveamento de cor (como foi feito no logo e na faixa de solo) em vez de pedir de novo.
- Conferir sempre se a imagem veio sem texto; se vier, pedir "refaça sem nenhum texto".

### Prompts que geraram as imagens atuais (use como base de estilo)
**Banner (assets/banner.webp)** — paisagem; terço esquerdo só céu para receber o título:
```
Ilustração panorâmica horizontal, realista com leve acabamento de pintura digital, de uma perfuração de poço de água subterrânea ao entardecer no sertão do Nordeste do Brasil. Composição pensada para tela de notebook: o terço esquerdo é só céu em degradê azul-marinho para dourado e colinas suaves, com espaço calmo e vazio para receber um título. Nos dois terços da direita: sonda de perfuração em um caminhão, corte transversal do solo com camadas de rocha e areia e um lençol de água azul-turquesa embaixo. Todos os elementos importantes ficam na faixa central, sem nada nas bordas superior e inferior, porque a imagem será cortada em formato bem largo. Paleta: azul-marinho #0a2238, dourado #c8923b, creme #efe9db e azul água. Luz quente de fim de tarde, aparência profissional e sóbria. Sem texto, sem letras, sem logotipo, sem pessoas.
```
**Logo (assets/logo.webp)** — símbolo sem texto, fundo azul-marinho removido depois:
```
Símbolo de logotipo, sem texto: uma gota de água dourada (#e8bd6a) com linhas finas de camadas de solo dentro dela e uma pequena torre de perfuração estilizada. Estilo vetorial plano, elegante, linhas limpas, contorno dourado, fundo azul-marinho sólido #0a2238. Quadrado, centralizado, com margem generosa. Sem letras e sem palavras.
```
**Faixa de solo do menu (assets/strip.webp)**:
```
Faixa horizontal estreita (proporção 4:1) de camadas geológicas em corte: areia, argila, rocha e um lençol de água azul-turquesa no fundo, em tons de azul-marinho, dourado e creme. Estilo vetorial limpo, sem texto.
```
