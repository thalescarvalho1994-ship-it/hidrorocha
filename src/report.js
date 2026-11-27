/* HidroLaudo – modelo do laudo: textos-base, dados de exemplo e montagem dos blocos (puro, sem DOM) */
(function (G) {
  const HL = G.HL = G.HL || {};
  const { num, fmt, sci } = HL;

  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const NUM_EXT = { 1: 'uma', 2: 'duas', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez' };

  // ---------- textos-base (partes fixas, editáveis) ----------
  const TEXTS = [
    { k: 'intro1', grupo: '1. Introdução', label: 'Finalidade e base legal', def:
      'Esse relatório tem como finalidade a obtenção da Outorga de Direito de Uso de Recursos Hídricos, captada por meio de um poço tubular profundo em conformidade com os decretos Estaduais n.º 06 de 23 de janeiro de 2001 e n.º 170 de 30 de maio de 2001, que regulamentam a Lei Estadual n.º 5.965 de 10 de novembro de 1997, a qual dispõe sobre a Política de Recursos Hídricos e institui o Sistema Integrado de Gerenciamento de Recursos Hídricos no Estado de Alagoas, em consideração a Lei Federal n.º 9.433.' },
    { k: 'intro2', grupo: '1. Introdução', label: 'Definição de outorga', def:
      'A Outorga de Direito de Uso de Recursos Hídricos é ato administrativo, mediante o qual o poder outorgante faculta ao outorgado o direito de uso de recursos hídricos, por prazo determinado, nos termos e nas condições expressas no respectivo ato (Artigo 1º). O parágrafo único deste artigo diz: “As análises dos pleitos de outorga deverão sempre levar em conta a interconexão das águas superficiais e subterrâneas e as interações observadas no ciclo hidrológico.”' },
    { k: 'intro3', grupo: '1. Introdução', label: 'Objeto do relatório', def:
      'No presente relatório é apresentado os resultados obtidos com a avaliação do relatório técnico do teste de vazão escalonado do poço tubular, para pedido de Outorga de Direito de Uso de Recursos Hídricos, construído {{no_local}}, município de {{municipioUF}} e necessita explotar {{Q}}m^{3}/h ou {{Qdia}}m^{3}/dia em regime de bombeamento de {{horas}} horas/dia, no uso para {{finalidade}} (Formulário {{formulario}}).' },
    { k: 'intro4', grupo: '1. Introdução', label: 'Poço testado', def:
      'O poço tubular {{poco}} foi testado em {{mesTeste}} pela {{empresa}}, com sede em {{sedeEmpresa}}, tendo uma profundidade útil de {{profUtil}} metros e revestido como tubos e filtros {{revestimento}} no diâmetro de {{diametro}}.' },
    { k: 'intro5', grupo: '1. Introdução', label: 'ART', def:
      'O presente relatório está registrado no {{crea}} pela ART – Anotação de Responsabilidade Técnica de n.º {{art}}, anexa ao processo.' },
    { k: 'loc1', grupo: '2. Localização', label: 'Endereço', def:
      '{{O_local}} está situado {{prep}} {{endereco}}, bairro {{bairro}}, município de {{municipioUF}} (Figura 01).' },
    { k: 'loc3', grupo: '2. Localização', label: 'Coordenadas', def:
      'O poço tubular {{poco}} está situado em área de propriedade {{do_interessado}} {{interessado}} ({{local}}), georreferenciado pelas coordenadas geográficas {{lat}} de Latitude {{latHem}} e {{lon}} de Longitude {{lonHem}} (Figura 03).' },
    { k: 'geo2', grupo: '3. Hidrogeologia', label: 'Introdução do quadro litoestratigráfico', def:
      'De maneira simplificada pode-se apresentar para esta região, a provável litoestratigrafia da área.' },
    { k: 'recarga', grupo: '3. Hidrogeologia', label: 'Recarga e exutórios', def:
      'A recarga dos sistemas aquíferos na área de estudo ocorre principalmente, pela infiltração direta das águas de chuva.\nOs exutórios naturais dos aquíferos na região são as fontes, drenagem e Oceano Atlântico, enquanto o artificial é representado pela explotação dos poços.\nUma parte da recarga anual dos aquíferos é drenada para os exutórios naturais, enquanto outra parte e drenada para os artificiais.' },
    { k: 'cadastro', grupo: '3. Hidrogeologia', label: 'Cadastro de poços', def:
      'O cadastro teve como objetivo à localização desses poços na área, para com base na definição da vazão de explotação avaliar as possíveis interferências que possam vir a ocorrer quando esse poço estiver em regime de bombeamento. {{cadastroFrase}}' },
    { k: 'expl1', grupo: '3. Hidrogeologia', label: 'Condições de explotação (aquífero)', def:
      'Na área {{do_local}}, onde está situado o poço tubular profundo, em função dos dados dos perfis litológicos dos poços da região foi estimado que {{aquifero}} sob o ponto de vista hidrogeológico se apresenta como um aquífero {{comportamento}}.' },
    { k: 'teste1', grupo: '3. Hidrogeologia', label: 'Teste de bombeamento', def:
      'Foi realizado em {{dataTesteBR}}, {{tipoTeste}}, sendo utilizada para tal fim uma bomba submersa {{bomba}}, com duração de {{duracao}} {{horasEtapa}}, cujos dados estão apresentados nas fichas de Ensaio de Bombeamento{{escalonadoFim}}, anexa ao processo.' },
    { k: 'teste2', grupo: '3. Hidrogeologia', label: 'Análise do ensaio', def:
      'O ensaio de bombeamento {{escalonado}}foi analisado com o objetivo definir a capacidade máxima permissível e vazão de explotação, que atenda a demanda {{do_local}}, objeto do pedido de outorga, que pode ser resumido no Quadro 01.' },
    { k: 'teste3', grupo: '3. Hidrogeologia', label: 'Parâmetros hidrodinâmicos', def:
      'Com os dados de rebaixamento medidos durante o teste de bombeamento{{escalonadoFim}}, foi possível avaliar utilizando o programa {{programa}} os parâmetros hidrodinâmicos: coeficiente de transmissividade (T) e condutividade hidráulica (K), considerando uma espessura saturada de {{espessura}} metros para o {{aquifero}}, cujos resultados estão no Quadro 02.' },
    { k: 'expl2', grupo: '3. Hidrogeologia', label: 'Critérios de explotação', def:
      'As condições de explotação do poço tubular {{poco}} {{do_local}} foram determinadas levando em consideração:\n- Vazão Máxima Permissível pelo Filtro;\n- Vazão Máxima Permissível pelo Furo;\n- Vazão Máxima Possível e de Explotação.' },
    { k: 'expl3', grupo: '3. Hidrogeologia', label: 'Filtro e furo não avaliados', def:
      'A Vazão Máxima Permissível pelo Filtro e a Vazão Máxima Permissível pelo Furo, em função da inexistência dos dados do perfil construtivo e litológico, deixam de ser avaliadas.' },
    { k: 'qmpo1', grupo: '3. Hidrogeologia', label: 'Rebaixamento disponível', def:
      'A vazão máxima possível é determinada em função do rebaixamento disponível. Para efeito de cálculo o rebaixamento disponível é considerado como sendo o máximo que se pode rebaixar num poço sem comprometer o regime de explotação. Como não se conhece a posição da seção filtrante o rebaixamento disponível (Rd) é avaliado pela seguinte expressão:' },
    { k: 'qexp1', grupo: '3. Hidrogeologia', label: 'Equação característica', def:
      'Com os dados do Quadro 1, se obtém os valores de n, B e C, onde a equação característica do poço é dada por:' },
    { k: 'qexp2', grupo: '3. Hidrogeologia', label: 'Equação do poço (eficiência)', def:
      'A equação característica do poço para uma eficiência de {{ef}}%, obtida por meio de um gráfico é:' },
    { k: 'dem1', grupo: '3. Hidrogeologia', label: 'Justificativa da demanda (1)', def:
      '{{O_local}} utiliza água subterrânea captada de poço tubular {{poco}} para fins de uso para {{finalidade}}, totalizando uma demanda estimada em {{Qdia}}m^{3}/dia, a ser atendida com uma vazão de {{Q}}m^{3}/h em regime diário de bombeamento de {{horas}}:00 horas.' },
    { k: 'dem2', grupo: '3. Hidrogeologia', label: 'Justificativa da demanda (2)', def:
      'Para o cálculo do volume da demanda {{do_local}}, no que diz respeito ao {{usos}} foram utilizados os indicativos constantes nas Tabelas de Consumos Médios Diários e Consumos Potenciais, conforme Melo e Neto (1988), in Tomaz (2000) e discriminados no formulário {{formulario}} anexo ao processo.' },
    { k: 'interf1', grupo: '3. Hidrogeologia', label: 'Interferências (método)', def:
      'Com base nos parâmetros indicado para o {{aquifero}}{{interfCad}}, foi utilizado o método de Cooper-Jacob (Custódio & Llamas, 1976) para avaliação das possíveis interferências que possam ocorrer em poços que porventura existam na área e/ou venham a ser perfurados, por ocasião do poço {{poco}} {{do_local}} em regime de explotação.' },
    { k: 'interf2', grupo: '3. Hidrogeologia', label: 'Interferências (quadro)', def:
      'No Quadro 03 estão apresentados os rebaixamentos provocados para diferentes raios de interferência, para uma vazão de explotação de {{Q}}m^{3}/h num regime de bombeamento de {{horas}}h/dia.' },
    { k: 'god1', grupo: '3. Hidrogeologia', label: 'Vulnerabilidade (conceito)', def:
      'O conceito de vulnerabilidade de aquíferos aplicado à contaminação antrópica é seguramente uma das formas mais adequadas de se encarar a preservação da qualidade dos recursos hídricos subterrâneos. Adequar à atividade humana em função da capacidade de suporte do meio, ou seja, quando ele pode atenuar cargas contaminantes, é fazer uma parceira com as características naturais do terreno para uma ocupação ambientalmente responsável.\nGOD é um dos mais simples métodos para definição da vulnerabilidade de aqüíferos. Foi desenvolvido para analisar apenas a susceptibilidade das águas subterrâneas à uma contaminação geral, podendo ser acoplado a um sistema de cargas contaminantes, resultando em definições de riscos de poluição.\nO Índice de Vulnerabilidade do Aquífero por meio do Método GOD (Foster 1987 e Foster & Hirata 1993) é definido pela interação, por meio de multiplicação de 3 parâmetros: tipo de aquífero (Groundwater ocurrence), litologia da zona não saturada (Overall of lithology of aquiperm) e profundidade da água subterrânea (Depth of groundwater). GOD forma um acróstico, a partir dos fatores que permitem o cálculo final do índice.' },
    { k: 'god2', grupo: '3. Hidrogeologia', label: 'Vulnerabilidade (parâmetros)', def:
      '#Parâmetros de Entrada:\n- Tipo de Aquífero (G)\nSurgente, Confinado, Semiconfinado, Livre (coberto) e Livre (aflorante).\n- Litologia da zona não saturada (O)\nGrau de consolidação e caráter litológico.\n- Distância da água (D)\nNível estático para aquífero livre e topo do aquífero confinado.\n#Parâmetros de saída:\nA cada um desses parâmetros de entrada é atribuído um valor cujo Índice Qualitativo indica o grau de vulnerabilidade, que pode ser:\nNulo, Baixo, Moderado, Alto e Extremo.' },
    { k: 'god3', grupo: '3. Hidrogeologia', label: 'Vulnerabilidade (resultado)', def:
      'A partir dos dados do nível estático do teste de bombeamento do poço e das informações estimada do {{aquifero}} na área, com base na metodologia GOD, o poço tubular profundo {{poco}} {{do_local}} encontra-se em área de vulnerabilidade natural {{godClasse}} em relação ao risco de contaminação das águas subterrâneas, com índice igual a {{godIdx}} (Quadro 04).' },
    { k: 'qual1', grupo: '4. Qualidade da água', label: 'Resultado da análise', def:
      'Conforme Certificado n° {{cert}} conforme Relatório de Análise anexo ao processo, da análise físico-química e bacteriológica da amostra n° {{amostra}} de {{dataAmostraBR}}, realizada pela {{lab}}, com sede em {{sedeLab}}, comparando-se os valores estabelecidos pela {{portaria}}, a água produzida no poço tubular profundo {{poco}} {{do_local}}, se apresenta sob o ponto de vista físico-químico e bacteriológico, {{qualFrase}}' },
    { k: 'qual2', grupo: '4. Qualidade da água', label: 'Resultado com dois certificados (físico-química e bacteriológica)', def:
      'Conforme Certificado n.º {{cert}} da análise físico-química da amostra {{amostraTxt}} e Certificado n.º {{certBac}} da análise bacteriológica da amostra {{amostraBacTxt}} de {{dataAmostraBR}}, em anexo, realizadas pela {{lab}}, com sede em {{sedeLab}}, {{qualFrase2}}' },
    { k: 'conc0', grupo: '5. Conclusões', label: 'Conclusões (abertura)', def:
      'Com base na avaliação hidrogeológica da área e dos parâmetros hidrodinâmicos do poço construído em área {{do_local}}, podemos estabelecer as seguintes conclusões:' },
    { k: 'conc1', grupo: '5. Conclusões', label: 'Conclusão: quantidade', def:
      '- a avaliação da vazão de explotação do poço tubular {{poco}} permite explotar {{Q}}m^{3}/h em regime de bombeamento de {{horas}}h/dia, sem comprometimento na área do {{aquifero}} em termos quantitativos;' },
    { k: 'conc2', grupo: '5. Conclusões', label: 'Conclusão: interferência', def:
      '- os rebaixamentos calculados para possíveis poços vizinhos num raio máximo de {{rmax}} metros, conforme Quadro 03, interfere em poços existentes dentro desse raio, mas não compromete as captações existentes e/ou futuras captações, desde que sejam levados em consideração no rebaixamento disponível por ocasião da definição das vazões de explotação desses poços;' },
    { k: 'conc3', grupo: '5. Conclusões', label: 'Conclusão: qualidade', def: '- {{qualConclusao}}' },
    { k: 'conc4', grupo: '5. Conclusões', label: 'Conclusão: pedido', def:
      '- pelo exposto nesse laudo, solicitamos a Outorga de Direito de Uso de Recursos Hídricos para explotação de {{Q}}m^{3}/h do poço tubular profundo {{poco}} localizado {{no_local}}, em área de propriedade {{do_interessado}} {{interessadoUp}}, juntando ao mesmo a documentação exigida pela {{orgao}}, inclusive os formulários {{formsAnexos}} (específicos para os fins a que se destinam), apresentados no respectivo processo.' },
    { k: 'refs', grupo: '6. Referências', label: 'Referências bibliográficas', def:
      'BRASIL 1975 Convênio PETROBRÁS/DNPM. Carta Geológica da Bacia Sergipe e Alagoas, folha SC.25-V-IV-2 (Maceió) na escala de 1:50.000.\nDONEZAR, M. 1975 Analisis y Evaluacion de los datos de Ensayos por Bombeo. Boletín 11s. Holanda. 213 p.\nFOSTER, S. & HIRATA, R.C. 1993 Determinação do Risco de Contaminação das Águas Subterrâneas: Um Método Baseado em Dados Existentes. São Paulo – Instituto Geológico, P. Il., tabs 23 cm (Boletim, 10).\nFOSTER, S.; VENTURA, M. & HIRATA, R.C. 1987. Contaminacion de las aguas subterraneas: um enfoque ejecutivo de la situación em América Latina y el Caribe em ralación com el Suministro de água Potable. CEPIS technical Reports (OMS, OPS-HPE, CEPIS, Lima-Perú) 42 p. il.\nMENDES, V.A.; LIMA, M.A.B.; MORAIS, D.M.F. de. 2013. Programa Geologia do Brasil-PGB. Geologia e Recursos Minerais do Estado de Alagoas. Mapa de Recursos Minerais do Estado de Alagoas. Escala: 1:250.000. Recife: CPRM/2015. 1 mapa colorido;\nTOMAZ, P. 2000. Previsão de Consumo de Água – Interface das Instalações Prediais de Água e Esgoto com os Serviços Públicos. Editora Navegar. 251 p.' }
  ];
  const TEXT_BY_KEY = {}; TEXTS.forEach(t => TEXT_BY_KEY[t.k] = t);

  // variáveis que podem ser usadas nos textos
  const TOKENS = [
    ['poco', 'código do poço'], ['local', 'nome do local'], ['o_local', 'o/a + local'], ['do_local', 'do/da + local'], ['no_local', 'no/na + local'],
    ['ao_local', 'ao/à + local'], ['interessado', 'interessado'], ['interessadoUp', 'INTERESSADO (maiúsculas)'], ['do_interessado', 'do/da (interessado)'],
    ['municipioUF', 'Município-UF'], ['Q', 'vazão de explotação (m³/h)'], ['Qdia', 'volume por dia (m³)'], ['horas', 'horas de bombeamento'],
    ['aquifero', 'nome do aquífero'], ['finalidade', 'finalidade do uso'], ['art', 'número da ART'], ['crea', 'CREA-UF']
  ];

  // ---------- relatório novo / exemplo ----------
  function uid() { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function emptyTK() { return [{ t: '', k: '', e: '' }, { t: '', k: '', e: '' }, { t: '', k: '', e: '' }]; }
  function blank() {
    return {
      id: uid(), criado: Date.now(), atualizado: Date.now(),
      g: { interessado: '', artInt: 'o', local: '', artLocal: 'o', poco: '', municipio: '', uf: 'AL', dataLaudo: '', art: '', finalidade: 'Abastecimento Humano e Outras finalidades',
        formulario: 'F-06', formsAnexos: 'F-01, F-03, F-05 e F-06', orgao: 'SEMARH', status: 'rascunho',
        respNome: 'Wilton José Silva da Rocha', respTitulo: 'Hidrogeólogo', respRegistro: 'CONFEA 180617525-8' },
      loc: { prep: 'na', endereco: '', bairro: '', acesso: '', latG: '', latM: '', latS: '', latHem: 'Sul', lonG: '', lonM: '', lonS: '', lonHem: 'Oeste' },
      poco: { profUtil: '', diametro: '4”', revestimento: 'PVC geomecânico aditivado', empresa: '', sedeEmpresa: '' },
      teste: { data: '', bomba: '', duracao: '02:00', programa: 'GWW (ONU, 1995)', espessura: '', aquifero: 'Aquífero Barreiras',
        etapas: [{ ne: '', nd: '', q: '' }, { ne: '', nd: '', q: '' }, { ne: '', nd: '', q: '' }],
        tk: { theis: emptyTK(), jacob: emptyTK(), hantush: emptyTK() } },
      hid: { PB: '', SB: '0', NE: '', VS: '1', I: '1', rp: '0,051', S: '0,0004', T: '', B: '', C: '', n: '2', ef: '', Q: '', horas: '12', P: '',
        avaliarFF: 'nao', rf: '', hs: '', Ve: '0,03', alfa: '0,08', dfiltro: '' },
      geo: { contexto: 'Com base no Mapa de Recursos Minerais do Estado de Alagoas, na escala de 1:250.000, publicado pelo Programa Geologia do Brasil-PGB (CPRM/2015), o poço tubular profundo {{poco}} foi construído num contexto hidrogeológico regional predominantemente constituído por sedimentos Terciários do Grupo Barreiras (ENb). Localmente esses sedimentos estão sobrepostos as rochas sedimentares da Formação Marituba (K1mrt) (Figura 04).',
        unidades: [{ per: 'Terciário', un: 'Grupo Barreiras (ENb)', lit: 'Areias quartzosas com intercalações de argilas e siltes de cores variegadas.' },
                   { per: 'Cretáceo', un: 'Formação Marituba (k1mrt)', lit: 'Arenito médio a grosso cinzento.' }],
        perfil: '', comportamento: 'semi-confinado a livre' },
      dem: { usos: '' },
      interf: { raios: '100 200 300 400', raioCadastro: '500', nPocos: '0' },
      god: { gSel: 'Semiconfinado', g: '0,4', oSel: 'Sedimentos inconsolidados', o: '0,9', d: '', d_dist: '' },
      qual: { cert: '', amostra: '', certBac: '', amostraBac: '', data: '', lab: '', sede: '', portaria: 'Portaria GM/MS n° 888 de 04.05.2021', resultado: 'nao_atende', foraEm: 'ambos', parametros: '' },
      figs: { f1: { fonte: '' }, f2: { fonte: '' }, f3: { fonte: '' }, f4: { fonte: '' } },
      txt: {}
    };
  }
  function sample() {
    const r = blank();
    r.nome = 'CMV-01 · Colégio Madre Valdelícia';
    Object.assign(r.g, { interessado: 'Centro Educacional Madre Valdelícia Martins da Silva', artInt: 'o', local: 'Colégio Madre Valdelícia', artLocal: 'o', poco: 'CMV-01',
      municipio: 'Maceió', uf: 'AL', dataLaudo: '2026-08-20', art: 'AL20260563078' });
    Object.assign(r.loc, { prep: 'na', endereco: 'Rua C-05, nº 275, Quadra C-3', bairro: 'Benedito Bentes',
      acesso: 'O acesso ao Colégio Madre Valdelícia pode ser feito a partir do bairro Guaxuma pela Avenida Rota do Mar e/ou a partir do bairro Benedito Bentes pela Avenida Cachoeira do Meirim e Avenida Benedito Bentes, até a Rua C-3, onde está o Colégio Madre Valdelícia (Figura 01 e 02).',
      latG: '09', latM: '35', latS: '05,58', lonG: '35', lonM: '45', lonS: '52,94' });
    Object.assign(r.poco, { profUtil: '80,00', empresa: 'GEOTECH', sedeEmpresa: 'Maceió-AL' });
    Object.assign(r.teste, { data: '2026-06-23', bomba: 'marca Hidrax modelo SDX100 de 1.0 CV-380V-Trifásica', espessura: '12,5' });
    r.teste.etapas = [{ ne: '53,500', nd: '53,609', q: '1,45' }, { ne: '53,500', nd: '54,016', q: '2,90' }, { ne: '53,500', nd: '54,780', q: '7,210' }];
    r.teste.tk = {
      theis: [{ t: '6,70e-4', k: '5,36e-5', e: '0,02' }, { t: '1,18e-3', k: '9,44e-5', e: '0,00' }, { t: '5,67e-4', k: '4,53e-5', e: '0,04' }],
      jacob: [{ t: '6,87e-4', k: '5,496e-5', e: '0,02' }, { t: '1,35e-3', k: '1,080e-4', e: '0,00' }, { t: '6,64e-4', k: '5,312e-5', e: '0,06' }],
      hantush: [{ t: '5,24e-4', k: '4,192e-5', e: '0,01' }, { t: '1,05e-3', k: '8,400e-5', e: '0,00' }, { t: '5,45e-4', k: '4,360e-5', e: '0,13' }]
    };
    Object.assign(r.hid, { PB: '56,00', SB: '0', NE: '53,50', VS: '1', I: '1', rp: '0,051', S: '0,0004', T: '9,208e-4', B: '0,1379', C: '0,005628', n: '2', ef: '84,7', Q: '6', horas: '12', P: '66,00' });
    r.geo.perfil = 'Não existe relatório técnico com dados do perfil litológico do poço, com base na descrição dos poços existentes na região, o Poço {{poco}} esta situado numa sequência sedimentar constituída de areia média a grossa, rosa esbranquiçada predominante, pouco argilosa, com intercalações de areia fina e grossa e argila de coloração variegada em toda sequência. Essas areias da Formação Barreiras apresentam boas condições hidrogeológicas e representa o principal aquífero para captação por meio de poços tubulares.';
    r.dem.usos = 'abastecimento humano e uso doméstico de 274 colaboradores, uso de 8 banheiros para funcionários e alunos, lavagem de áreas comuns e piscina';
    r.god.d = ''; // em branco: usa a tabela D (53,50 m → 0,6)
    Object.assign(r.qual, { cert: '4822/2026-B', amostra: '5011', data: '2026-07-21', lab: 'Central Analítica', sede: 'Maceió-AL', resultado: 'nao_atende', parametros: 'Ferro Total, Cor e Turbidez' });
    r.figs.f1.fonte = 'FONTE: Folha SC.25-V-C-IV – MI-1600 - Maceió DSG/MEX/SUDENE – Escala: 1: 100.000';
    return r;
  }

  // ---------- variáveis dos textos ----------
  function dateParts(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }
  function articles(g) {
    return g === 'a' ? { o: 'a', O: 'A', do: 'da', no: 'na', ao: 'à' } : { o: 'o', O: 'O', do: 'do', no: 'no', ao: 'ao' };
  }
  function coord(g, m, s) {
    if (!g && !m && !s) return '—';
    return (g || '0') + '° ' + (m || '0') + '’ ' + (s || '0') + '”';
  }
  function makeVars(r, c) {
    const g = r.g, F = fmt;
    const aL = articles(g.artLocal), aI = articles(g.artInt);
    const dl = dateParts(g.dataLaudo), dt = dateParts(r.teste.data), dq = dateParts(r.qual.data);
    const horas = num(r.hid.horas);
    const nPocos = num(r.interf.nPocos) || 0;
    const rc = r.interf.raioCadastro || '500';
    const uf = (g.uf || '').toUpperCase();
    const v = {
      poco: g.poco, local: g.local, interessado: g.interessado, interessadoUp: (g.interessado || '').toUpperCase(),
      o_local: aL.o + ' ' + g.local, O_local: aL.O + ' ' + g.local, do_local: aL.do + ' ' + g.local, no_local: aL.no + ' ' + g.local, ao_local: aL.ao + ' ' + g.local,
      do_interessado: aI.do, municipio: g.municipio, uf, municipioUF: g.municipio + (uf ? '-' + uf : ''),
      finalidade: g.finalidade, formulario: g.formulario, formsAnexos: g.formsAnexos, orgao: g.orgao, art: g.art, crea: 'CREA-' + uf,
      Q: F(c.Q, 0 === (c.Q % 1) ? 0 : 2), Qdia: c.Qdia !== null ? F(c.Qdia, 0 === (c.Qdia % 1) ? 0 : 2) : '—', horas: horas !== null ? String(horas) : '—',
      mesTeste: dt ? MESES[dt.m - 1].toLowerCase() + ' de ' + dt.y : '—',
      dataTesteBR: dt ? [String(dt.d).padStart(2, '0'), String(dt.m).padStart(2, '0'), dt.y].join('.') : '—',
      dataAmostraBR: dq ? [String(dq.d).padStart(2, '0'), String(dq.m).padStart(2, '0'), dq.y].join('.') : '—',
      empresa: r.poco.empresa, sedeEmpresa: r.poco.sedeEmpresa, profUtil: r.poco.profUtil, revestimento: r.poco.revestimento, diametro: r.poco.diametro,
      prep: r.loc.prep, endereco: r.loc.endereco, bairro: r.loc.bairro,
      lat: coord(r.loc.latG, r.loc.latM, r.loc.latS), lon: coord(r.loc.lonG, r.loc.lonM, r.loc.lonS), latHem: r.loc.latHem, lonHem: r.loc.lonHem,
      aquifero: r.teste.aquifero, comportamento: r.geo.comportamento, espessura: r.teste.espessura, programa: r.teste.programa,
      bomba: r.teste.bomba, duracao: r.teste.duracao, nEtapasExt: NUM_EXT[r.teste.etapas.length] || String(r.teste.etapas.length),
      // teste de etapa única (vazão constante) x escalonado
      tipoTeste: r.teste.etapas.length > 1 ? 'um teste de bombeamento escalonado de ' + (NUM_EXT[r.teste.etapas.length] || r.teste.etapas.length) + ' etapas' : 'um teste de bombeamento de vazão constante em etapa única',
      horasEtapa: r.teste.etapas.length > 1 ? 'horas/etapa' : 'horas',
      escalonado: r.teste.etapas.length > 1 ? 'escalonado ' : '', escalonadoFim: r.teste.etapas.length > 1 ? ' escalonado' : '',
      usos: r.dem.usos, raioCadastro: rc,
      cadastroFrase: nPocos === 0
        ? 'Não foram cadastrados poços na periferia ' + aL.do + ' ' + g.local + ' dentro de um raio de ' + rc + ' metros.'
        : 'Foram cadastrados ' + nPocos + ' poços na periferia ' + aL.do + ' ' + g.local + ' dentro de um raio de ' + rc + ' metros.',
      interfCad: nPocos === 0 ? ' e em função da inexistência (não foram cadastrados) de poços num raio de ' + rc + ' metros' : '',
      ef: c.ef !== null && c.ef !== undefined ? F(c.ef, 1) : '—',
      rmax: c.rmax !== null ? F(c.rmax, 2) : '—',
      godClasse: c.god.classe || '—', godIdx: c.god.idx !== null ? F(c.god.idx, 2) : '—',
      cert: r.qual.cert, amostra: r.qual.amostra, lab: r.qual.lab, sedeLab: r.qual.sede, portaria: r.qual.portaria,
      cidade: g.municipio,
      dataExtenso: dl ? dl.d + ' de ' + MESES[dl.m - 1] + ' de ' + dl.y : '—'
    };
    const atende = r.qual.resultado === 'atende';
    v.qualFrase = atende
      ? 'com base nos parâmetros analisados, dentro dos limites permitidos para fins de potabilidade para consumo humano.'
      : 'com base nos parâmetros analisados dos resultados obtidos ' + (r.qual.parametros ? 'de ' + r.qual.parametros + ', ' : '') + 'fora dos limites permitidos para fins de potabilidade para consumo humano.';
    // em qual análise a água ficou fora do padrão (dois certificados: pode ser só a bacteriológica, como no JCC-01)
    const fora = { fq: 'físico-químico', bac: 'bacteriológico' }[r.qual.foraEm] || 'físico-químico e bacteriológico';
    const par = r.qual.parametros ? ' (' + r.qual.parametros + ')' : '';
    v.qualConclusao = atende
      ? 'do ponto de vista qualitativo a água sob o ponto de vista físico-químico e bacteriológico atende aos padrões de potabilidade;'
      : 'do ponto de vista qualitativo a água sob o ponto de vista ' + fora + par + ', não atende todos os padrões de potabilidade;';
    const amTxt = a => !a ? '—' : /^s\/?n$/i.test(String(a).trim()) ? 'de água s/n' : 'n° ' + a;
    v.certBac = r.qual.certBac; v.amostraTxt = amTxt(r.qual.amostra); v.amostraBacTxt = amTxt(r.qual.amostraBac);
    v.qualFrase2 = atende
      ? 'mostra com base nos parâmetros analisados, uma qualidade de água que se encontra dentro dos padrões de potabilidade estabelecidos pela ' + r.qual.portaria + '.'
      : 'mostra com base nos parâmetros analisados' + par + ', uma qualidade de água que se encontra fora dos padrões de potabilidade estabelecidos pela ' + r.qual.portaria + '.';
    return v;
  }
  function render(tpl, vars) {
    return String(tpl).replace(/\{\{(\w+)\}\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m));
  }

  // ---------- blocos do relatório ----------
  function buildBlocks(r, c) {
    const vars = makeVars(r, c), F = fmt;
    const B = [];
    const tx = k => render(r.txt && r.txt[k] !== undefined ? r.txt[k] : TEXT_BY_KEY[k].def, vars);
    const para = (text) => text.split('\n').forEach(line => {
      line = line.trim(); if (!line) return;
      if (line[0] === '#') B.push({ t: 'p', text: line.slice(1), bold: true, noIndent: true });
      else if (line.startsWith('- ')) B.push({ t: 'li', text: line });
      else B.push({ t: 'p', text: line });
    });
    const P = k => para(tx(k));
    const h1 = (n, text) => B.push({ t: 'h1', num: n, text });
    const h2 = (n, text) => B.push({ t: 'h2', num: n, text });
    const h3 = (n, text) => B.push({ t: 'h3', num: n, text });
    const dec = (x, d) => (x === null || x === undefined) ? '—' : F(x, d);
    const loc = vars.do_local;

    // capa
    B.push({ t: 'cov', text: (r.g.interessado || '').toUpperCase(), size: 15, bold: true, after: 700, before: 1200 });
    B.push({ t: 'cov', text: (r.g.local || '').toUpperCase(), size: 18, bold: true, after: 900 });
    B.push({ t: 'cov', text: 'Solicitação de Outorga de Direito de Uso de Recursos Hídricos', size: 14, after: 1200 });
    B.push({ t: 'cov', text: 'L A U D O    H I D R O G E O L Ó G I C O', size: 18, bold: true, after: 500 });
    B.push({ t: 'cov', text: 'Poço ' + r.g.poco, size: 16, bold: true, after: 2600 });
    const dl = dateParts(r.g.dataLaudo);
    B.push({ t: 'cov', text: vars.municipioUF, size: 13, bold: true, after: 100 });
    B.push({ t: 'cov', text: dl ? MESES[dl.m - 1] + '-' + dl.y : '', size: 13, after: 0 });
    B.push({ t: 'pb' });

    // 1
    h1('1.0', 'INTRODUÇÃO');
    P('intro1'); P('intro2'); P('intro3'); P('intro4'); P('intro5');

    // 2
    h1('2.0', 'LOCALIZAÇÃO E VIAS DE ACESSO');
    P('loc1');
    if (r.loc.acesso) para(render(r.loc.acesso, vars));
    const fig = (key, n, cap) => B.push({ t: 'fig', img: (r.figs[key] || {}).data || null, w: (r.figs[key] || {}).w, h: (r.figs[key] || {}).h,
      caption: 'Figura ' + n + ' – ' + cap, fonte: (r.figs[key] || {}).fonte || '' });
    fig('f1', '01', 'Mapa de localização ' + loc + '.');
    fig('f2', '02', 'Mapa de localização ' + loc + ' e Vias de Acesso.');
    P('loc3');
    fig('f3', '03', 'Mapa de localização do poço tubular ' + r.g.poco + ' em relação ' + vars.ao_local + '.');

    // 3
    h1('3.0', 'HIDROGEOLOGIA');
    h2('3.1', 'Considerações Gerais');
    para(render(r.geo.contexto, vars));
    fig('f4', '04', 'Esboço geológico com indicação do poço tubular ' + r.g.poco + ' ' + loc + '.');
    P('geo2');
    // períodos iguais em linhas seguidas viram uma célula mesclada
    const rowsU = r.geo.unidades.map(u => [u.per, u.un, u.lit]);
    for (let i = 0; i < rowsU.length;) {
      let j = i + 1; while (j < rowsU.length && rowsU[i][0] && rowsU[j][0] === rowsU[i][0]) j++;
      if (j - i > 1) { rowsU[i][0] = { t: rowsU[i][0], rs: j - i }; for (let k = i + 1; k < j; k++) rowsU[k][0] = null; }
      i = j;
    }
    B.push({ t: 'table', caption: '', head: ['Período', 'Unidade litoestratigráfica', 'Litologia'],
      rows: rowsU, widths: [18, 32, 50], align: ['c', 'c', 'l'] });
    if (r.geo.perfil) para(render(r.geo.perfil, vars));
    P('recarga');
    h2('3.2', 'Cadastro de Poços');
    P('cadastro');
    h2('3.3', 'Condições de Explotação');
    P('expl1'); P('teste1'); P('teste2');
    B.push({ t: 'table', caption: 'Quadro 01 – Resumo dos parâmetros hidrogeológicos do teste de bombeamento escalonado.',
      head: ['Etapa', 'N. Estático (m)', 'N. Dinâmico (m)', 'Rebaixamento (m)', 'Vazão (m^{3}/h)', 'Capacidade Específica ((m^{3}/h)/m)'],
      rows: c.stages.map((s, i) => [(i + 1) + 'ª', dec(s.NE, 3), dec(s.ND, 3), dec(s.Sw, 3), dec(s.Q, 2), dec(s.q, 3)]),
      widths: [10, 16, 16, 18, 16, 24], align: ['c', 'c', 'c', 'c', 'c', 'c'] });
    P('teste3');
    // células sem dado ficam em branco (não "—")
    const sb = (x, d) => (x === null || x === undefined) ? '' : sci(x, d);
    const fb = (x, d) => (x === null || x === undefined) ? '' : F(x, d);
    const rowsTK = [], grey = { t: '', shade: true };
    [['theis', 'Theis'], ['jacob', 'Jacob'], ['hantush', 'Hantush']].forEach(([m, nome]) => {
      const mm = c.metodos[m];
      mm.rows.forEach((x, i) => rowsTK.push([i === 0 ? { t: nome, rs: mm.rows.length } : null, String(i + 1), sb(x.T, 2), sb(x.K, 3), fb(x.E, 2)]));
      rowsTK.push([{ t: 'Média', cs: 2 }, null, sb(mm.Tm, 2), sb(mm.Km, 3), grey, 'bold']);
    });
    rowsTK.push([{ t: 'Média Geral', cs: 2 }, null, sb(c.geral.Tm, 3), sb(c.geral.Km, 3), grey, 'bold']);
    B.push({ t: 'table', caption: 'Quadro 02 – Parâmetros hidrodinâmicos do poço tubular ' + r.g.poco + ' ' + loc + '.',
      head: ['Método', 'Etapa', 'T (m^{2}/s)', 'K (m/s)', 'Erro (%)'],
      headRows: [[{ t: 'Método', rs: 2 }, { t: 'Etapa', rs: 2 }, { t: 'Parâmetros', cs: 2 }, null, { t: 'Erro (%)', rs: 2 }], [null, null, 'T (m^{2}/s)', 'K (m/s)', null]],
      rows: rowsTK, widths: [18, 12, 26, 26, 18], align: ['c', 'c', 'c', 'c', 'c'] });
    P('expl2');
    let eqn = 0; const eq = text => B.push({ t: 'eq', text, n: ++eqn });
    const hd = r.hid;
    if (c.ff) { // poço com perfil construtivo: avalia furo e filtro
      B.push({ t: 'p', text: 'Vazão Máxima Permissível pelo Furo', bold: true, noIndent: true });
      eq('Q_{mpfr} = 2.π.r_{f}.h_{s}.v_{max}');
      B.push({ t: 'p', text: 'Onde:', noIndent: true });
      B.push({ t: 'kv', rows: [
        ['r_{f}', 'raio de perfuração', '= ' + dec(num(hd.rf), 3) + 'm;'],
        ['h_{s}', 'extensão da seção filtrante', '= ' + dec(num(hd.hs), 2) + 'm;'],
        ['v_{max}', 'velocidade máxima dada por K^{0,5}/20, sendo K a condutividade hidráulica', '= ' + (c.ff.vmax !== null ? sci(c.ff.vmax, 3) : '—') + 'm/s.']] });
      B.push({ t: 'p', text: 'Q_{mpfr} = vazão máxima permissível pelo furo de ' + dec(c.ff.Qfuro, 1) + 'm^{3}/h.', bold: true, noIndent: true });
      B.push({ t: 'p', text: 'Vazão Máxima Permissível pelo Filtro', bold: true, noIndent: true });
      eq('Q_{mpf} = Ve.π.α/2.d.h_{s}');
      B.push({ t: 'p', text: 'Onde:', noIndent: true });
      B.push({ t: 'kv', rows: [
        ['Ve', 'velocidade permissível de entrada', '= ' + dec(num(hd.Ve), 2) + 'm/s;'],
        ['α', 'percentagem de área aberta dos filtros', '= ' + dec(num(hd.alfa), 2) + ';'],
        ['d', 'diâmetro dos filtros', '= ' + dec(num(hd.dfiltro), 3) + 'm;'],
        ['h_{s}', 'extensão da seção filtrante', '= ' + dec(num(hd.hs), 2) + 'm.']] });
      B.push({ t: 'p', text: 'Q_{mpf} = vazão máxima permissível pelo filtro de ' + dec(c.ff.Qfiltro, 1) + 'm^{3}/h.', bold: true, noIndent: true });
    } else P('expl3');
    h3('3.3.1', 'Vazão Máxima Possível (Qmpo) e de Explotação (Qexp)');
    P('qmpo1');
    eq('Rd = PB – SB – NE – VS – I,');
    B.push({ t: 'p', text: 'Onde:', noIndent: true });
    B.push({ t: 'kv', rows: [
      ['PB', 'profundidade da bomba', '= ' + dec(num(hd.PB), 2) + 'm;'],
      ['SB', 'submergência da bomba', '= ' + dec(num(hd.SB), 2) + 'm;'],
      ['NE', 'nível estático', '= ' + dec(num(hd.NE), 2) + 'm;'],
      ['VS', 'variação sazonal', '= ' + dec(num(hd.VS), 2) + 'm;'],
      ['I', 'interferência de outros poços na área', '= ' + dec(num(hd.I), 2) + 'm.']] });
    B.push({ t: 'p', text: 'Efetuando as substituições na equação acima, temos um rebaixamento disponível de ' + dec(c.Rd, 1) + ' metros.' });
    eq('Qmpo = T.Sw/0,183[log{2,25.T.t/rp^{2}.S}]');
    B.push({ t: 'p', text: 'Onde:', noIndent: true });
    B.push({ t: 'kv', rows: [
      ['T', 'transmissividade (m^{2}/seg)', '= ' + sci(c.T, 3) + ';'],
      ['Sw', 'rebaixamento disponível (m)', '= ' + dec(c.Rd, 2) + ';'],
      ['t', 'tempo de bombeamento (seg)', '= ' + (c.t !== null ? F(c.t, 0) : '—') + ';'],
      ['rp', 'raio da seção filtrante (m)', '= ' + dec(num(hd.rp), 3) + ';'],
      ['S', 'coeficiente de Armazenamento (adimensional)', '= ' + dec(num(hd.S), 4) + '.']] });
    B.push({ t: 'p', text: 'A vazão máxima possível (Qmp) obtida é de ' + dec(c.Qmpo, 2) + 'm^{3}/h.' });
    B.push({ t: 'h3', num: '3.3.2', text: 'Vazão de Explotação' });
    P('qexp1');
    eq('Sw = BQ + CQ^{n}');
    B.push({ t: 'p', text: 'Onde,', noIndent: true });
    B.push({ t: 'kv', rows: [['BQ', 'mostra as perdas de carga no aquífero;', ''], ['CQ^{n}', 'mostra as perdas de carga devido a construção do poço.', '']] });
    P('qexp2');
    eq('Sw = ' + F(c.B, 4) + '.Q + ' + F(c.C, 6) + '.Q' + (c.n === 2 ? '^{2}' : '^{' + F(c.n, 2) + '}'));
    if (c.Sw !== undefined && c.Rd)
      B.push({ t: 'p', text: 'Com base na equação (' + eqn + '), para a vazão solicitada para outorga de ' + vars.Q + 'm^{3}/h foi obtido um rebaixamento de ' + dec(c.Sw, 2) + ' metros, que corresponde a ' + dec(100 * c.Sw / c.Rd, 1) + '% do rebaixamento disponível (Rd) de ' + dec(c.Rd, 2) + ' metros.' });
    B.push({ t: 'p', text: 'Em função do exposto acima, as condições de explotação do poço para uma vazão de ' + vars.Q + 'm^{3}/h são as seguintes:' });
    B.push({ t: 'kv', rows: [
      ['Profundidade do poço', 'P', '= ' + dec(num(hd.P), 2) + 'm;'],
      ['Nível estático', 'NE', '= ' + dec(num(hd.NE), 2) + 'm;'],
      ['Nível dinâmico', 'ND', '= ' + dec(c.ND, 2) + 'm;'],
      ['Rebaixamento', 'Sw', '= ' + dec(c.Sw, 2) + 'm;'],
      ['Vazão de explotação', 'Q', '= ' + dec(c.Q, 2) + 'm^{3}/h;'],
      ['Capacidade Específica', 'q', '= ' + dec(c.qesp, 3) + '(m^{3}/h)/m;'],
      ['Posição da bomba (crivo)', 'PC', '= ' + dec(c.PC, 2) + 'm.']], wide: true });
    h2('3.4', 'Justificativa da Demanda');
    P('dem1'); P('dem2');
    h2('3.5', 'Cálculo das interferências');
    P('interf1'); P('interf2');
    const rowsI = c.interf.map((x, i) => [String(i + 1), 'Raio ' + (i + 1), F(x.r, 2), F(x.s, 2)]);
    if (c.rmax !== null) rowsI.push([String(c.interf.length + 1), 'Raio Máximo', F(c.rmax, 2), F(0, 2)]);
    B.push({ t: 'table', caption: 'Quadro 03 – Interferência nos poços e raio máximo na área provocada pelo bombeamento do poço tubular ' + r.g.poco + ' ' + loc + '.',
      head: ['N.º', 'Local', 'Distância (m)', 'Rebaixamento (m)'], rows: rowsI, widths: [12, 36, 26, 26], align: ['c', 'c', 'c', 'c'] });
    h2('3.6', 'Vulnerabilidade dos Aquíferos');
    P('god1'); P('god2'); P('god3');
    B.push({ t: 'table', caption: 'Quadro 04 – Vulnerabilidade natural na área do poço tubular ' + r.g.poco + ' ' + loc + '.',
      head: ['Poço', 'Parâmetro', 'Dado', 'Valor'], widths: [16, 40, 28, 16], align: ['c', 'l', 'c', 'c'],
      rows: [
        [{ t: r.g.poco, rs: 5 }, 'Condições do Aquífero – G', r.god.gSel, dec(c.god.G, 2)],
        [null, 'Litologia da Zona não Saturada – O', r.god.oSel, dec(c.god.O, 2)],
        [null, 'Distância da Água – D', dec(c.god.depth, 2) + ' m', dec(c.god.D, 2)],
        [null, { t: 'Índice G x O x D', cs: 2 }, null, dec(c.god.idx, 2), 'bold'],
        [null, { t: 'Vulnerabilidade Natural', cs: 2 }, null, c.god.classe ? c.god.classe.charAt(0) + c.god.classe.slice(1).toLowerCase() : '—', 'bold']] });

    // 4
    h1('4.0', 'QUALIDADE DA ÁGUA');
    P(String(r.qual.certBac || '').trim() ? 'qual2' : 'qual1');
    // 5
    h1('5.0', 'CONCLUSÕES');
    P('conc0'); P('conc1'); P('conc2'); P('conc3'); P('conc4');
    B.push({ t: 'p', text: vars.cidade + ', ' + vars.dataExtenso, noIndent: true, center: true, before: 500 });
    B.push({ t: 'sig', nome: r.g.respNome, titulo: r.g.respTitulo, registro: r.g.respRegistro });
    B.push({ t: 'pb' });
    h1('6.0', 'REFERÊNCIAS BIBLIOGRÁFICAS');
    tx('refs').split('\n').filter(Boolean).forEach(l => B.push({ t: 'ref', text: l }));
    return B;
  }

  // ---------- grade de tabela com células mescladas ----------
  // Célula: texto, {t, rs (linhas), cs (colunas)} ou null (coberta por uma célula mesclada).
  // Retorna, por linha, as peças a desenhar: {k:'cell', c, t, rs, cs} ou {k:'cont', c, cs} (continuação vertical).
  function tableGrid(b) {
    const n = b.head.length, owner = b.rows.map(() => new Array(n).fill(null));
    const grid = b.rows.map((row, ri) => {
      const out = [], bold = row.length > n && row[n] === 'bold';
      for (let ci = 0; ci < n; ci++) {
        const v = row[ci];
        if (v === null || v === undefined) {
          const o = owner[ri][ci];
          if (o && o.c === ci && o.r < ri) out.push({ k: 'cont', c: ci, cs: o.cs, origin: o });
          else if (!o) out.push({ k: 'cell', c: ci, t: '', rs: 1, cs: 1 });
          continue;
        }
        const cell = typeof v === 'object' ? { t: v.t === undefined || v.t === null ? '' : String(v.t), rs: v.rs || 1, cs: v.cs || 1, shade: !!v.shade } : { t: String(v), rs: 1, cs: 1 };
        cell.rs = Math.min(cell.rs, b.rows.length - ri); cell.cs = Math.min(cell.cs, n - ci);
        const o = { r: ri, c: ci, rs: cell.rs, cs: cell.cs, bold };
        for (let a = 0; a < cell.rs; a++) for (let z = 0; z < cell.cs; z++) if (a || z) owner[ri + a][ci + z] = o;
        out.push(Object.assign({ k: 'cell', c: ci, bold }, cell));
      }
      return { bold, cells: out };
    });
    return grid;
  }
  // cabeçalho como grade (uma ou mais linhas, com mesclas)
  const headGrid = b => tableGrid({ head: b.head, rows: b.headRows || [b.head] });

  Object.assign(HL, { MESES, TEXTS, TEXT_BY_KEY, TOKENS, blank, sample, makeVars, render, buildBlocks, dateParts, tableGrid, headGrid });
})(typeof globalThis !== 'undefined' ? globalThis : window);
