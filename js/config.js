/* Tudo que a Joyce pode querer trocar fica aqui. */
window.CONFIG = {
  nome: 'Joyce Avila',
  whatsapp: '5547996848763', // link wa.me da bio do Instagram
  instagram: 'nutricionistajoyceavila',
  crn: 'CRN 13760P', // como aparece nos posts. Confirmar a região (ex.: 'CRN-10 13760/P')
  mensagem: 'Olá, Joyce! Vi seu site e quero agendar uma consulta.',
  // Prêmio: deixe "fonte" vazio para esconder a linha da premiação/ano
  premio: {
    titulo: 'Eleita a melhor nutricionista de Joinville',
    fonte: '' // ex.: 'Prêmio Destaque Joinville · 2026'
  }
};

window.linkWA = function (msg) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || CONFIG.mensagem);
};
