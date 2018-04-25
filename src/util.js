// utils

export const toEOSAmount = (amount, symbol = 'EOS') => {
  return (amount / 10000).toFixed(4) + ' ' + symbol
}

export const getExpiration = (expirateIn = 60) => {
  const time = new Date().getTime()
  return new Date(time + expirateIn * 1000).toISOString().split('.')[0]
}
