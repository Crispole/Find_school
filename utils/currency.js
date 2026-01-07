export const EXCHANGE_RATES = {
  CLP: 1,
  UF: 39700,
  USD: 900
};

export const parseValue = (valueStr) => {
  if (!valueStr || valueStr === "Gratuito" || valueStr === "No aplica") {
    return { amount: 0, currency: 'CLP', original: valueStr, isFree: true };
  }

  let amount = 0;
  let currency = 'CLP';

  const cleanStr = valueStr.trim();

  if (cleanStr.startsWith('UF')) {
    currency = 'UF';
    amount = parseFloat(cleanStr.replace('UF', '').replace(/\./g, '').replace(',', '.').trim());
  } else if (cleanStr.startsWith('$')) {
    currency = 'CLP';
    amount = parseFloat(cleanStr.replace('$', '').replace(/\./g, ''));
  } else if (cleanStr.startsWith('USD')) {
    currency = 'USD';
    amount = parseFloat(cleanStr.replace('USD', '').trim());
  }

  return { amount, currency, isFree: false };
};

export const convertAndFormat = (valueStr, targetCurrency, rates) => {
  const { amount, currency: sourceCurrency, original, isFree } = parseValue(valueStr);

  if (isFree) return original;

  // Use provided rates or fallbacks
  const exchangeRates = rates || { CLP: 1, UF: 38000, USD: 980 };

  // Convert to CLP (Base)
  let amountInCLP = 0;
  if (sourceCurrency === 'CLP') amountInCLP = amount;
  else if (sourceCurrency === 'UF') amountInCLP = amount * exchangeRates.UF;
  else if (sourceCurrency === 'USD') amountInCLP = amount * exchangeRates.USD;

  // Convert to Target
  let finalAmount = 0;
  if (targetCurrency === 'CLP') finalAmount = amountInCLP;
  else if (targetCurrency === 'UF') finalAmount = amountInCLP / exchangeRates.UF;
  else if (targetCurrency === 'USD') finalAmount = amountInCLP / exchangeRates.USD;

  // Format
  return formatCurrency(finalAmount, targetCurrency);
};

export const formatCurrency = (amount, currency) => {
  if (currency === 'CLP') {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  } else if (currency === 'UF') {
    return `UF ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return `${amount}`;
};
