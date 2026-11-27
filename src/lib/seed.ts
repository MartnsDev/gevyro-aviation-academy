import {db,save} from './db';
import {terms,lessonTopics,reference,safetyExamples} from '@/modules/english/content';
import {seedMmaCourse} from '@/modules/exercises/mma-course';
async function stable(user:string,key:string){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user+':'+key)));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes.slice(0,16)).map(x=>x.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
export async function seedContent(user:string,onProgress?:(n:number)=>void){const put=async(entity:Parameters<typeof save>[1],key:string,data:Record<string,unknown>,parent:string|null=null)=>{const id=await stable(user,key);if(!await db.records.get(id))await save(user,entity,data,id,parent);return id;};const shared={origin:'Autoral Gevyro',status:'pending_review',reference};
 for(let i=0;i<terms.length;i++){const term=terms[i];await put('vocabulary','term:'+i,{...term,...shared});if(i<60)await put('flashcards','card:'+i,{front:term.term,back:term.translation,deck:term.category,interval:0,ease:2.5,repetitions:0,due:new Date().toISOString(),...shared});onProgress?.(i/terms.length*.5);}
 for(let i=0;i<lessonTopics.length;i++){const [title,theory,category]=lessonTopics[i];const lesson=await put('english_lessons','lesson:'+i,{title,theory,category,level:i<7?'Introdutório':i<15?'Básico':i<23?'Intermediário':'Técnico avançado',order:i,...shared});for(let j=0;j<7;j++){const term=terms[(i*10+j)%terms.length];const kinds=['translate','reverse','multiple','fill','order','matching','dictation'];const kind=kinds[j];const prompt=kind==='reverse'?`Escreva em inglês: ${term.translation}`:kind==='multiple'?`Qual a tradução de "${term.term}"?`:kind==='fill'?`Complete o termo em inglês: ${term.term.slice(0,2)}___ (${term.translation})`:kind==='order'?`Ordene as palavras: ${term.term.split(' ').reverse().join(' / ')}`:kind==='matching'?`Associe "${term.term}" ao significado em português.`:kind==='dictation'?'Ouça o termo e escreva em inglês.':`Traduza: ${term.term}`;const distractors=Array.from(new Set(terms.map(item=>item.translation).filter(value=>value!==term.translation)));await put('english_exercises',`eng:${i}:${j}`,{lesson_id:lesson,kind,prompt,term:term.term,answer:['reverse','fill','order','dictation'].includes(kind)?term.term:term.translation,options:[term.translation,...[0,1].map(n=>distractors[(i*7+j*3+n)%distractors.length])],...shared},lesson);}}
 for(let i=0;i<safetyExamples.length;i++)await put('english_exercises','interpret:'+i,{lesson_id:'interpretation',kind:'interpret',prompt:safetyExamples[i].text,answer:safetyExamples[i].translation,...safetyExamples[i],...shared});
 const facts=[
 ['Segurança','Por que a documentação deve ter aplicabilidade verificada?','Porque revisões e procedimentos podem se aplicar a configurações específicas.','Porque qualquer manual de aeronave é intercambiável.'],
 ['Documentação','O que um IPC ajuda a identificar?','Peças e suas referências ilustradas.','A aprovação automática de um reparo.'],
 ['Documentação','Qual é a finalidade educacional de consultar um AMM?','Compreender a organização dos procedimentos de manutenção do fabricante.','Substituir toda documentação regulamentar.'],
 ['Fatores humanos','Como uma passagem de turno documentada contribui para a segurança?','Reduz a perda de informações sobre tarefas e condições pendentes.','Elimina a necessidade de inspeção.'],
 ['Materiais','O que distingue corrosão de uma simples sujeira superficial?','A corrosão envolve degradação química ou eletroquímica do material.','Toda sujeira é perda estrutural.'],
 ['Eletricidade','Em um circuito ideal, qual é a unidade de resistência?','Ohm.','Ampère.'],
 ['Eletricidade','Em um circuito ideal, qual é a unidade de corrente?','Ampère.','Volt.'],
 ['Eletricidade','Qual é a relação da Lei de Ohm para um resistor ideal?','V = R × I.','V = R + I.'],
 ['Metrologia','Por que verificar a calibração de um instrumento?','Para avaliar se suas medições são rastreáveis e adequadas ao uso.','Porque calibração elimina todos os erros de leitura.'],
 ['Ferramentas','Qual grandeza um torquímetro indica?','Torque.','Pressão hidráulica.'],
 ['Estruturas','Qual elemento de asa tem função principal longitudinal?','Longarina.','Pneu.'],
 ['Estruturas','Qual é a tradução aeronáutica de rib?','Nervura.','Longarina.'],
 ['Segurança','Qual é o objetivo do controle de ferramentas?','Reduzir a possibilidade de ferramentas esquecidas e objetos estranhos.','Substituir procedimentos de manutenção.'],
 ['Desenho técnico','Qual a finalidade de indicar a escala em um desenho?','Relacionar dimensões representadas às dimensões do objeto.','Permitir ignorar cotas numéricas.'],
 ['Peso e balanceamento','Como se define momento em um modelo estático simples?','Produto do peso pelo braço.','Soma do peso com o braço.'],
 ['Peso e balanceamento','Qual é o papel do datum?','Servir de referência para medição dos braços.','Indicar sempre a ponta da asa.'],
 ['Tubulações','O que uma identificação de linha deve ajudar a reconhecer?','O sistema ou fluido associado, conforme documentação aplicável.','A autorização de operação da aeronave.'],
 ['Combustíveis','Por que controlar contaminação do combustível?','Porque contaminantes podem comprometer o funcionamento do sistema.','Porque qualquer combustível é compatível com qualquer motor.'],
 ['Inspeção','Uma trinca pode ser aceita apenas por parecer pequena?','Não; a avaliação depende dos limites e dados aplicáveis.','Sim; toda trinca pequena é aceitável.'],
 ['Fatores humanos','Qual conduta favorece o trabalho diante de uma dúvida técnica?','Interromper a decisão insegura e consultar dados e supervisão apropriados.','Improvisar para cumprir o prazo.'],
 ['SIPAER','Qual é a finalidade preventiva da investigação de segurança operacional?','Identificar fatores contribuintes e prevenir ocorrências.','Substituir automaticamente processos judiciais.'],
 ['Documentação','P/N e S/N representam a mesma informação?','Não; referência da peça e identificação serial têm finalidades distintas.','Sim; são sempre intercambiáveis.'],
 ['Materiais','Qual característica distingue um compósito?','A combinação de constituintes com funções complementares.','A ausência de qualquer matriz.'],
 ['Corrosão','Por que metais diferentes em contato merecem atenção?','Podem formar um par galvânico na presença de eletrólito.','Nunca apresentam corrosão.'],
 ['Ferramentas','Qual a utilidade de um calibre de lâminas?','Verificar folgas compatíveis com o instrumento.','Medir corrente elétrica.'],
 ['Metrologia','Qual instrumento mede diretamente uma tensão elétrica?','Voltímetro.','Paquímetro.'],
 ['Física','Qual é a unidade de força no SI?','Newton.','Quilograma.'],
 ['Física','Qual é a unidade de pressão no SI?','Pascal.','Joule.'],
 ['Física','Qual é a unidade de energia no SI?','Joule.','Watt.'],
 ['Física','Qual é a unidade de potência no SI?','Watt.','Volt.'],
 ['Segurança','Um exemplo didático pode autorizar manutenção real?','Não; exige-se documentação e habilitação aplicáveis.','Sim; basta o exemplo estar na internet.'],
 ['Eletricidade','Qual proteção atua interrompendo um circuito sob condições especificadas?','Disjuntor ou fusível, conforme o projeto.','Arruela lisa.'],
 ['Inspeção','O que caracteriza um ensaio não destrutivo?','A avaliação sem inutilizar intencionalmente a peça pelo método.','A ausência de critérios de aceitação.'],
 ['Materiais','Fadiga está associada principalmente a que condição?','Carregamentos cíclicos.','Apenas sujeira superficial.'],
 ['Documentação','Onde verificar a aplicabilidade de uma revisão?','Nos dados de aplicabilidade do documento e da configuração.','Na cor da capa.'],
 ['Segurança','Por que uma etiqueta de condição é relevante?','Ajuda a comunicar o estado e a rastreabilidade do componente.','Dispensa registros.'],
 ['Ferramentas','Por que usar uma ferramenta apropriada ao fixador?','Para reduzir danos e executar a tarefa conforme os dados aplicáveis.','Porque qualquer ferramenta tem o mesmo resultado.'],
 ['Desenho técnico','O que uma linha de centro costuma representar?','Eixos ou simetria, conforme a convenção do desenho.','Sempre um corte físico.'],
 ['Fatores humanos','Por que a fadiga humana merece gerenciamento?','Pode reduzir atenção, julgamento e desempenho.','Não afeta tarefas técnicas.'],
 ['Regulamentação','Onde verificar requisitos aeronáuticos brasileiros vigentes?','Nas publicações oficiais aplicáveis da ANAC e demais autoridades competentes.','Somente em resumos de redes sociais.'],
 ['Documentação','O que o SRM normalmente organiza?','Dados e limites relativos a estruturas e reparos.','Somente receitas de mistura de combustível.'],
 ['Documentação','O que o WDM apresenta?','Diagramas de fiação.','Somente desenhos de pneus.'],
 ['Documentação','Qual a finalidade do CMM?','Documentação de manutenção de componentes.','Uma lista genérica de aeroportos.'],
 ['Segurança','Qual é o papel dos EPIs?','Reduzir exposição a riscos dentro de medidas de proteção adequadas.','Eliminar todos os perigos.'],
 ['Física','Massa e peso são a mesma grandeza?','Não; peso é força e depende da gravidade.','Sim; ambas têm unidade newton no SI.'],
 ['Eletricidade','O que caracteriza corrente contínua ideal?','Sentido constante ao longo do tempo.','Inversão periódica obrigatória de sentido.'],
 ['Tubulações','Qual é a importância do raio de curvatura de uma mangueira?','Pode afetar integridade e restrições de instalação.','É sempre irrelevante.'],
 ['Metrologia','Como reduzir erro de paralaxe em uma escala?','Observar a escala na direção adequada ao instrumento.','Ler em qualquer ângulo.'],
 ['Corrosão','Uma pintura pode contribuir para proteção contra corrosão?','Sim, como barreira, quando adequada ao sistema de proteção.','Não, revestimentos nunca influenciam.'],
 ['Segurança','Qual é o objetivo de preservar registros reais de estudo?','Documentar atividades efetivamente realizadas.','Produzir uma certificação oficial automática.']
 ];
 for(let i=0;i<facts.length;i++){const [subject,prompt,answer,wrong]=facts[i];const q=await put('questions','mma:fact:'+i,{number:String(i+1),prompt,options:[answer,wrong],kind:'multiple',subject,chapter:'Fundamentos',page:1,document_id:'',explanation:answer,...shared});await put('answer_keys','key:fact:'+i,{question_id:q,answer:'0',source:'Autoral Gevyro — revisão técnica pendente',confirmed:true},q);}
 // Exercícios paramétricos autorais: valores e fórmulas explícitos, sem alegação de prova oficial.
 for(let i=0;i<100;i++){const mode=i%10;const n=Math.floor(i/10)+1;const a=n+1,b=n+3;const prompts=[`Converta ${a} polegadas para milímetros (1 in = 25,4 mm).`,`Um resistor ideal de ${b} Ω recebe ${a} A. Qual a tensão em V?`,`Um circuito ideal tem tensão ${a*12} V e corrente 2 A. Qual a potência em W?`,`Uma massa de ${a} kg tem braço de ${b} m. Qual o produto massa × braço em kg·m?`,`Uma grandeza aumenta de ${a*10} para ${a*12}. Qual o aumento percentual?`,`Calcule a área em cm² de um retângulo de ${a} cm por ${b} cm.`,`Converta ${a*1000} mm para metros.`,`Uma força de ${a*10} N atua perpendicularmente a um braço de 2 m. Qual o torque em N·m?`,`Converta ${a} litros para mililitros.`,`Em proporção direta, ${a} peças têm massa de ${a*3} kg. Qual a massa de ${b} peças em kg?`];const results=[a*25.4,b*a,a*24,a*b,20,a*b,a,a*20,a*1000,b*3];const formulas=['mm = in × 25,4','V = R × I','P = V × I','Momento de massa = massa × braço','Variação (%) = (final − inicial) / inicial × 100','Área = comprimento × largura','m = mm / 1000','Torque = força × braço perpendicular','mL = L × 1000','Massa por peça = massa total / quantidade'];const answer=String(Number(results[mode].toFixed(6)));const q=await put('questions','mma:calc:'+i,{number:String(51+i),prompt:prompts[mode]+' Responda somente com o número.',options:[],kind:'calculation',subject:['Matemática','Eletricidade','Eletricidade','Peso e balanceamento','Matemática','Desenho técnico','Metrologia','Física','Combustíveis','Matemática'][mode],chapter:'Cálculos educacionais',page:1,document_id:'',explanation:`${formulas[mode]}. Resultado: ${answer}.`,...shared});await put('answer_keys','key:calc:'+i,{question_id:q,answer,source:'Cálculo autoral com fórmula indicada',confirmed:true},q);}
 await seedMmaCourse(user,(key,entity,data,parent=null)=>put(entity,key,data,parent));
 onProgress?.(1);
}
