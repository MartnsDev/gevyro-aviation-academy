export const courseMaterials = [
  { slug: 'capitulos-01-02', title: 'Capítulos 01 e 02', subject: 'MMA · Curso Básico', pages: 55, bytes: 15704516, source: 'Apostila A', href: '/apostilas/mma-capitulos-01-02.pdf' },
  { slug: 'exercicios-basico-aluno', title: 'Apostila de exercícios do aluno', subject: 'MMA · Curso Básico', pages: 230, bytes: 1180293, source: 'Caderno Básico', href: '/apostilas/exercicios-basico-aluno.pdf' },
  { slug: 'capitulos-03-04', title: 'Capítulos 03 e 04', subject: 'MMA · Curso Básico', pages: 52, bytes: 17155886, source: 'Apostila B', href: '/apostilas/mma-capitulos-03-04.pdf' },
  { slug: 'capitulos-05-06-a', title: 'Capítulos 05 e 06 A', subject: 'MMA · Curso Básico', pages: 43, bytes: 16735333, source: 'Apostila C', href: '/apostilas/mma-capitulos-05-06-a.pdf' },
  { slug: 'capitulo-06', title: 'Capítulo 6', subject: 'MMA · Curso Básico · edição complementar', pages: 86, bytes: 48076250, source: 'Apostila C', href: '/apostilas/mma-capitulo-06.pdf' },
  { slug: 'capitulos-07-08-a', title: 'Capítulos 07 e 08-A', subject: 'MMA · Curso Básico', pages: 83, bytes: 28229106, source: 'Apostila D', href: '/apostilas/mma-capitulos-07-08-a.pdf' },
  { slug: 'capitulo-08-b', title: 'Capítulo 08-B', subject: 'MMA · Curso Básico', pages: 83, bytes: 27025747, source: 'Apostila E', href: '/apostilas/mma-capitulo-08-b.pdf' },
  { slug: 'capitulos-09-10-a', title: 'Capítulos 09 e 10A', subject: 'MMA · Curso Básico', pages: 104, bytes: 29962894, source: 'Apostila F', href: '/apostilas/mma-capitulos-09-10-a.pdf' },
  { slug: 'capitulo-11-a', title: 'Capítulo 11-A', subject: 'MMA · Curso Básico', pages: 100, bytes: 44631065, source: 'Apostila G', href: '/apostilas/mma-capitulo-11-a.pdf' },
  { slug: 'capitulos-12-13-crm', title: 'Capítulos 12 e 13 · CRM', subject: 'MMA · Curso Básico', pages: 68, bytes: 27722830, source: 'Apostila H', href: '/apostilas/mma-capitulos-12-13-crm.pdf' },
  { slug: 'crm', title: 'CRM', subject: 'MMA · Curso Básico', pages: 18, bytes: 229232, source: 'Apostila I', href: '/apostilas/mma-crm.pdf' },
  { slug: 'seguranca-de-voo', title: 'Segurança de Voo', subject: 'MMA · Curso Básico', pages: 35, bytes: 400610, source: 'Apostila J', href: '/apostilas/seguranca-de-voo.pdf' },
] as const;

export function courseMaterialId(user: string, slug: string) {
  const seed = `${user}:${slug}`;
  const hashes = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    for (let j = 0; j < hashes.length; j++) hashes[j] = Math.imul(hashes[j] ^ (code + j * 31), 0x01000193);
  }
  const hex = hashes.map(value => (value >>> 0).toString(16).padStart(8, '0')).join('').split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
