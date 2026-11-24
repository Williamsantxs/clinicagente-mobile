// "Dra. Ana Ribeiro" → "AR" (usado no avatar dos dentistas)
export function iniciais(nome) {
  return nome
    .replace(/^(Dra?\.)\s*/, '')
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('');
}
