export type GuideExercise={
 id:string;
 kind:'choice'|'fill'|'translate'|'order';
 prompt:string;
 options?:string[];
 answers:string[];
 hint:string;
 explanation:string;
};

export type GuideLesson={id:string;title:string;chapter:string;summary:string;lesson:string;exercises:GuideExercise[]};

const choice=(id:string,prompt:string,options:string[],answer:string,hint:string,explanation:string):GuideExercise=>({id,kind:'choice',prompt,options,answers:[answer],hint,explanation});
const fill=(id:string,prompt:string,answers:string[],hint:string,explanation:string):GuideExercise=>({id,kind:'fill',prompt,answers,hint,explanation});
const translate=(id:string,prompt:string,answers:string[],hint:string,explanation:string):GuideExercise=>({id,kind:'translate',prompt,answers,hint,explanation});
const order=(id:string,prompt:string,answers:string[],hint:string,explanation:string):GuideExercise=>({id,kind:'order',prompt,answers,hint,explanation});

export const guideLessons:GuideLesson[]=[
 {id:'manual-structure',title:'Como um manual é organizado',chapter:'Capítulo 3 · Estrutura dos manuais',summary:'Aprenda a localizar seções e reconhecer avisos antes de interpretar uma instrução.',lesson:'O guia apresenta partes comuns de manuais: Introduction (visão geral), Table of Contents (índice), Procedures (procedimentos), Warnings and Cautions (avisos e cuidados) e Diagrams and Schematics (diagramas e esquemas). Leia também notas, condições e referências; uma palavra isolada não define a tarefa.',exercises:[
  choice('ms-1','“Table of Contents” indica qual parte do documento?',['Índice','Lista de peças','Registro de manutenção','Limites operacionais'],'Índice','Procure o nome da seção.','A tabela de conteúdos organiza capítulos e seções.'),
  choice('ms-2','Onde se espera encontrar instruções detalhadas de uma tarefa?',['Procedures','Table of Contents','Introduction','Glossary'],'Procedures','A palavra está no plural.','Procedures são os procedimentos e suas etapas.'),
  fill('ms-3','Complete: “Warnings and ___” (avisos e cuidados).',['cautions','caution'],'Leia o nome da seção apresentado no capítulo 3.','A apostila chama a seção de Warnings and Cautions.'),
  translate('ms-4','Traduza “Diagrams and Schematics”.',['diagramas e esquemas','diagramas e esquemáticos'],'Use os dois substantivos da expressão.','O guia traduz a expressão como diagramas e esquemas.'),
  choice('ms-5','O que fazer se uma instrução do manual parecer ambígua?',['Esclarecer a dúvida antes de executar uma tarefa real','Escolher a tradução mais curta','Ignorar as notas','Usar apenas um tradutor automático'],'Esclarecer a dúvida antes de executar uma tarefa real','Considere a orientação de segurança do capítulo 2.','Uma dúvida de interpretação deve ser esclarecida antes da execução. Exemplo didático não autoriza manutenção.')
 ]},
 {id:'abbreviations',title:'Siglas e abreviações técnicas',chapter:'Capítulo 3 · Abreviações',summary:'Associe siglas comuns aos seus nomes e significados no contexto de documentação.',lesson:'A apostila reúne abreviações como A/C, ENG, LH/RH, P/N, SB, MM, AMM, IPC, MEL e CDL, além de TSN, CSN, TT, EICAS, FDR e TCAS. Confirme sempre o significado na legenda e no contexto do documento consultado.',exercises:[
  choice('ab-1','Em uma descrição de componente, “P/N” significa:',['Part Number','Pilot Name','Pressure Note','Panel Number'],'Part Number','É uma identificação de peça.','P/N é Part Number, o número de identificação/referência da peça.'),
  choice('ab-2','“LH/RH” indica:',['Left Hand / Right Hand','Low Heat / Rapid Heat','Landing Hatch / Rear Hatch','Left Hydraulic / Right Hydraulic'],'Left Hand / Right Hand','São orientações laterais.','LH e RH indicam lado esquerdo e lado direito.'),
  fill('ab-3','Complete: “AMM” = Aircraft ___ Manual.',['maintenance'],'É o tipo de manual citado no guia.','AMM significa Aircraft Maintenance Manual.'),
  choice('ab-4','Qual sigla corresponde ao catálogo ilustrado de peças?',['IPC','MEL','CDL','FDR'],'IPC','O nome em inglês contém “Illustrated Parts”.','IPC significa Illustrated Parts Catalog.'),
  fill('ab-5','“TSN” significa Time Since ___.',['new'],'A sigla descreve o tempo acumulado desde a condição inicial.','TSN significa Time Since New.')
 ]},
 {id:'imperatives',title:'Verbos de ação e instruções',chapter:'Capítulo 4 · Verbos imperativos',summary:'Identifique a ação principal e traduza comandos no imperativo.',lesson:'Instruções de manuais frequentemente começam com o verbo no imperativo, sem sujeito explícito. Check, remove, install, inspect e replace indicam ações. A tradução precisa manter o objeto da frase e não acrescentar etapas que o texto não informa.',exercises:[
  choice('im-1','O verbo “inspect” pede para:',['Inspecionar','Instalar','Apertar','Substituir'],'Inspecionar','Procure a ação de examinar uma condição.','Inspect significa inspecionar.'),
  fill('im-2','Complete a instrução: “___ the oil filter.” (Remova o filtro de óleo.)',['remove'],'O verbo começa com R.','Remove é o imperativo de remover.'),
  translate('im-3','Traduza “Tighten the bolts.”',['Aperte os parafusos','Apertar os parafusos'],'O enunciado é uma instrução direta.','Tighten the bolts é “Aperte os parafusos”.'),
  choice('im-4','Qual verbo significa “substitua”?',['Replace','Check','Clean','Record'],'Replace','É a ação feita para trocar um item por outro.','Replace significa substituir.'),
  order('im-5','Escreva em inglês, na ordem correta: “Verifique / a pressão hidráulica”.',['Check the hydraulic pressure','Check hydraulic pressure'],'Comece com o verbo no imperativo.','Em uma instrução direta, o verbo vem antes do objeto: Check the hydraulic pressure.')
 ]},
 {id:'sequence-phrases',title:'Condições, referências e sequência',chapter:'Capítulo 4 · Expressões comuns',summary:'Perceba como preposições e expressões mudam a ordem e as condições de uma frase.',lesson:'Before significa antes; after significa depois. As Required pode ser “conforme necessário”; In Accordance With, “de acordo com”; Prior to Installation, “antes da instalação”; Ensure Proper Alignment, “certifique-se do alinhamento adequado”. Leia a frase completa para saber a que ação ou condição cada expressão se aplica.',exercises:[
  choice('sq-1','“Before operating” indica que uma ação acontece:',['Antes de operar','Depois de operar','Durante a operação','Somente após a inspeção'],'Antes de operar','A expressão temporal começa com before.','Before operating significa antes de operar.'),
  fill('sq-2','Complete: “___ Required” (conforme necessário).',['as'],'A expressão tem duas palavras.','As Required significa conforme necessário.'),
  translate('sq-3','Traduza “Prior to Installation”.',['Antes da instalação','Antes de instalar'],'Prior to indica anterioridade.','Prior to Installation significa antes da instalação.'),
  choice('sq-4','“In Accordance With” introduz:',['Conformidade com uma referência ou requisito','Uma operação depois da instalação','Uma peça esquerda','Uma medição aproximada'],'Conformidade com uma referência ou requisito','A expressão aponta para algo que deve ser seguido.','In Accordance With significa de acordo com.'),
  translate('sq-5','Traduza “Ensure Proper Alignment”.',['Certifique-se do alinhamento adequado','Assegure o alinhamento correto'],'O verbo ensure pede confirmação de uma condição.','O sentido é confirmar que o alinhamento esteja correto/adequado.')
 ]},
 {id:'read-instructions',title:'Ler e decompor uma instrução',chapter:'Capítulo 4 · Palavras-chave e contexto',summary:'Separe ação, componente, condição e sequência sem perder o sentido da frase.',lesson:'No exemplo da apostila, “Inspect the LH wing for cracks or corrosion before performing maintenance”, a ação é Inspect, o componente é a asa esquerda, a condição procurada são trincas ou corrosão, e before performing estabelece a sequência. A tarefa real sempre depende de documentação atualizada e aplicável.',exercises:[
  choice('ri-1','Na frase de estudo, qual é a ação principal?',['Inspect','Wing','Cracks','Before'],'Inspect','Identifique o verbo no início.','Inspect é o imperativo e indica a ação principal.'),
  fill('ri-2','“LH” significa lado ___ (left).',['esquerdo','esquerda'],'A tradução acompanha “lado”.','LH é Left Hand, lado esquerdo.'),
  choice('ri-3','O que a instrução manda procurar?',['Cracks or corrosion','Oil pressure','Loose wires','Fuel contamination'],'Cracks or corrosion','O trecho começa com “for”.','A expressão indica trincas ou corrosão como condições a verificar.'),
  translate('ri-4','Traduza “before performing maintenance”.',['antes de realizar a manutenção','antes de executar a manutenção'],'Mantenha a relação de sequência.','Before indica que a ação ocorre antes da manutenção.'),
  order('ri-5','Escreva em português: “Inspect the LH wing for cracks or corrosion.”',['Inspecione a asa esquerda quanto a trincas ou corrosão','Inspecione a asa esquerda para verificar trincas ou corrosão'],'Preserve ação, local e condição procurada.','A frase pede inspecionar a asa esquerda procurando trincas ou corrosão.')
 ]},
 {id:'maintenance-report',title:'Relatório de discrepância (simulado)',chapter:'Capítulo 6 · Exercício aplicado',summary:'Pratique registrar achados em inglês com clareza, sem inventar reparos ou aprovação.',lesson:'Um relatório técnico precisa distinguir a discrepância observada da ação tomada e do estado da tarefa. Neste exercício, o cenário é fictício e treina idioma: relate somente o achado e indique que é necessária avaliação pelos dados aplicáveis. Não registre reparo, liberação ou conclusão que não ocorreu.',exercises:[
  choice('mr-1','Qual expressão significa “foi observado”?',['was observed','was installed','was approved','was removed'],'was observed','Procure uma forma passiva do verbo observe.','Was observed descreve um achado observado.'),
  fill('mr-2','Complete: “The inspection ___ a discrepancy.” (A inspeção identificou uma discrepância.)',['identified','found'],'O verbo está no passado.','Identified e found podem descrever um achado; ambas são aceitas.'),
  translate('mr-3','Traduza “Further evaluation is required.”',['É necessária avaliação adicional','Uma avaliação adicional é necessária'],'Required expressa necessidade.','A frase indica que é necessária avaliação adicional.'),
  choice('mr-4','Qual frase registra apenas o achado sem afirmar reparo ou liberação?',['A crack was observed on the LH wing.','The aircraft was repaired and released.','All limits were exceeded.','The component was replaced.'],'A crack was observed on the LH wing.','Escolha a frase que descreve somente uma observação.','O exercício pede registrar o achado observado sem inventar uma ação ou uma decisão de retorno ao serviço.'),
  fill('mr-5','Complete a frase de estado: “No return-to-service decision has been ___.”',['made'],'O verbo descreve uma decisão que ainda não foi tomada.','Made é o particípio de make: nenhuma decisão de retorno ao serviço foi tomada.')
 ]}
];

export const pronunciationPhrases=[
 {text:'Check the hydraulic pressure before operating the landing gear.',translation:'Verifique a pressão hidráulica antes de operar o trem de pouso.',source:'Exercício 1 da apostila'},
 {text:'Remove the oil filter and inspect for contamination.',translation:'Remova o filtro de óleo e inspecione quanto à contaminação.',source:'Exercício 2 da apostila'},
 {text:'Inspect the LH wing for cracks or corrosion.',translation:'Inspecione a asa esquerda quanto a trincas ou corrosão.',source:'Exemplo de interpretação do capítulo 4'},
 {text:'Ensure proper alignment before installation.',translation:'Certifique-se do alinhamento adequado antes da instalação.',source:'Expressões comuns do capítulo 4'},
 {text:'Record the inspection findings in the report.',translation:'Registre os achados da inspeção no relatório.',source:'Frase autoral de prática'}
];

export const simulatedReport={
 title:'Discrepancy report · Training scenario',
 prompt:'Cenário fictício: durante uma inspeção de estudo, foi observada uma trinca e corrosão na asa esquerda. Preencha os campos em inglês. Registre o achado e a necessidade de avaliação; não invente reparo nem liberação.',
 fields:[
  {id:'location',label:'Location',placeholder:'Where was the finding observed?',checks:[['lh wing','left wing','left-hand wing']]},
  {id:'finding',label:'Finding / discrepancy',placeholder:'What was found?',checks:[['crack','cracking'],['corrosion','corroded']]},
  {id:'status',label:'Action / status',placeholder:'What must happen next?',checks:[['evaluation','evaluate','assessment'],['required','needed','refer']]},
  {id:'release',label:'Return-to-service statement',placeholder:'State whether a release decision was made.',checks:[['no return-to-service decision','not released','no release decision','no return to service']]}
 ],
 model:'Location: LH wing. Finding: A crack and corrosion were observed. Status: Further evaluation using current applicable data is required. No repair or return-to-service decision has been made in this training scenario.'
};
