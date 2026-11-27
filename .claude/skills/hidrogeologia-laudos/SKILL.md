---
name: hidrogeologia-laudos
description: Regras técnicas dos laudos hidrogeológicos de outorga do Wilton Rocha (Alagoas) — método GOD pelo diagrama de Foster et al. (2002), Quadro 02 (T, K, médias), teste de bombeamento escalonado (Jacob, Theis, Hantush como no GWW), vazões máximas (furo, filtro, Qmpo), equação do poço, interferência e formato da ficha GEOTECH. Use ao mexer em cálculos, textos ou quadros do app wilton-laudos, ou ao conferir um laudo.
---

# Laudos hidrogeológicos — regras do Wilton

Fontes: laudos CMV-01 e JCC-01 (este é o modelo mais completo), fichas de teste da GEOTECH e o diagrama GOD que o geólogo enviou. Quando o laudo original e a fórmula divergirem, **não escolha sozinho**: anote a divergência e pergunte ao usuário.

## Quadro 02 — transmissividade e condutividade
- O geólogo roda o teste no **GWW for Windows (ONU, 1995)** e digita T (m²/s) e o erro (%) por etapa e por método (Theis, Jacob, Hantush).
- **K = T ÷ espessura saturada** (calculado, nunca digitado). Ex.: 1,65e-2 / 25 = 6,600e-4.
- Média de cada método = média das etapas com valor. **Média geral = média das médias dos métodos que têm valor** (JCC-01: (4,15e-2 + 8,24e-4)/2 = 2,116e-2). Sem dado → célula **em branco** (nunca repetir valor).
- Formato no laudo: colunas Método | Etapa | Parâmetros (T, K) | Erro (%); método mesclado na vertical; linhas "Média" e "Média Geral" mescladas nas duas primeiras colunas, em negrito, com o erro sombreado.
- T adotado nos cálculos = média geral (ou valor informado pelo geólogo).

## Teste escalonado (análise automática do app, `src/teste.js`)
- Cada etapa usa **ΔQ = Qᵢ − Qᵢ₋₁** e o rebaixamento acima do nível do fim da etapa anterior, com o tempo desde o início da etapa (supõe a etapa anterior estabilizada).
- Jacob: T = 0,183·ΔQ/Δs (Δs por ciclo log), reta na metade final do tempo (escala log). Se estabilizou, não se aplica.
- Theis: s = ΔQ/(4πT)·W(u); Hantush: s = ΔQ/(4πT)·W(u, r/B). Ajuste por mínimos quadrados.
- Erro (%) do app = desvio médio quadrático relativo do ajuste (o GWW pode usar outra definição: os números servem de sugestão, quem decide é o geólogo).

## Vazões e equação do poço
- Rd = PB − SB − NE − VS − I (padrões: SB 1, VS 1, I 1 m; JCC-01 usou SB = 1).
- Qmpo = T·Sw / (0,183·log[2,25·T·t / (rp²·S)]), t = horas/dia × 3600 s, rp = 0,051 m, S = 0,0004.
- Com perfil construtivo: **Qmpfr (furo) = 2·π·rf·hs·vmax, vmax = √K/20**; **Qmpf (filtro) = Ve·π·α·d·hs/2**, Ve = 0,03 m/s, α = 0,08. Sem perfil: o laudo diz que não foram avaliadas.
- Sw = B·Q + C·Qⁿ (n = 2), ND = NE + Sw, q = Q/Sw, % de Rd = Sw/Rd. B e C: regressão de Sw/Q × Q (o geólogo pode informar os do gráfico).
- Interferência (Cooper-Jacob): s(r) = 0,183·Q/T·log(2,25·T·t/(r²·S)); raio máximo rmax = √(2,25·T·t/S).

## GOD (Foster et al., 2002) — índice = G × O × D
- **G** (confinamento): nenhum 0 · surgente/jorrante 0 · confinado 0,2 · semiconfinado 0,4 · livre coberto 0,6 · livre (não confinado) 1,0.
- **O** (estratos de cobertura), 0,4 a 1,0: argila lacustrina/estuarina 0,4 · solos residuais 0,5 · silte, loess, till 0,6 · areia eólica 0,7 · areia aluvial/fluvioglacial 0,8 · cascalho de leques aluviais 0,9 · lamito/xisto 0,5 · siltito/tufo 0,6 · arenito 0,7 · calcário/calcarenito 0,8–1,0 · magmáticas/metamórficas antigas 0,6 · lava recente 0,7–0,8 · calcrete/cárstico 0,9–1,0. O Wilton usa "Sedimentos inconsolidados" = 0,9 para o Barreiras.
- **D** (nível d'água no livre / teto do confinado): < 5 m 0,9 · 5–20 m 0,8 · **20–50 m 0,7** · > 50 m 0,6 · rocha fraturada/cárstica: 1,0 em qualquer profundidade. Ex.: 39,6 m → 0,7 (correção pedida pelo geólogo).
- Classes: 0–0,1 nula (insignificante) · 0,1–0,3 baixa · 0,3–0,5 moderada (média) · 0,5–0,7 alta · 0,7–1,0 extrema. JCC-01: 0,4 × 0,9 × 0,7 = 0,25 → Baixa.

## Ficha de teste GEOTECH (PDF com texto, uma página por etapa)
Cabeçalho: POÇO BOMBEADO, LOCAL, MUNICÍPO/UF (sic), EXECUTOR, DATA DO INICIO, AQUÍFERO, ETAPA, PROFUNDIDADE DO POÇO, DIÂMETRO DO POÇO, NE, ND, Q (m³/h), CRIVO BOMBA (= PB), POTÊNCIA, MARCA/MODELO DA BOMBA, TEMPO DE BOMBEAMENTO (min). Tabela: [hora] t(min) ND Sw Q q | recuperação t' ND Sw tb/t'+1.

## Dados fixos do responsável
Wilton José Silva da Rocha — Hidrogeólogo — CONFEA 180617525-8. ART registrada no CREA-AL.

## Decisão sobre divergências (confirmada pelo usuário, nov/2026)
Os números do JCC-01 que não fecham (Qmpfr 666,9 com T no lugar de K; Qmpf 55,0 com d = 0,156; Rd 32,24/22,24; Qmpo e raio máximo) **eram erros do documento**. Regra: **seguir sempre a doutrina, isto é, as fórmulas acima**, mesmo que um laudo antigo traga outro número. Eficiência = 100·B·Q/Sw (o geólogo pode digitar outra, lida do GWW). Não "imitar" valores de laudos antigos.

## Qualidade da água
Um certificado (análise completa) → texto `qual1`. Dois certificados (físico-química + bacteriológica, como no JCC-01) → texto `qual2`; "Fora do padrão em" escolhe se a conclusão fala do físico-químico, do bacteriológico ou dos dois, com os parâmetros entre parênteses (ex.: Coliformes Totais). Amostra sem número: "s/n".