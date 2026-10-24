// Fallback rates, used until /api/indicators answers (and by that route if mindicador.cl fails)
export const EXCHANGE_RATES = {
  CLP: 1,
  UF: 39700,
  USD: 900
};

export const NO_INFO = 'Sin información';

// Amounts as they appear in the data: "$5.500.000", "UF 16.7", "90 UF", "USD 20.000"
const MONEY_PATTERN = /\$\s?(\d[\d.,]*)|UF\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?UF|USD\s?(\d[\d.,]*)/g;

// "5.500.000" -> 5500000 (dots as thousands), "16.7" / "16,7" -> 16.7 (decimal)
const parseNumber = (str) => {
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) return Number(str.replace(/\./g, ''));
  return parseFloat(str.replace(',', '.'));
};

const toCLP = (amount, currency, rates) => {
  if (currency === 'UF') return amount * rates.UF;
  if (currency === 'USD') return amount * rates.USD;
  return amount;
};

const fromCLP = (amountInCLP, currency, rates) => {
  if (currency === 'UF') return amountInCLP / rates.UF;
  if (currency === 'USD') return amountInCLP / rates.USD;
  return amountInCLP;
};

// Converts every amount inside the text and keeps the rest untouched, so
// "$283.000 - $352.000 (Mensual)" or "14 UF aprox." keep their context and
// non-numeric values like "Consultar" or "Gratuito" are shown as-is.
export const convertAndFormat = (valueStr, targetCurrency, rates) => {
  if (!valueStr) return NO_INFO;

  const exchangeRates = rates || EXCHANGE_RATES;

  return valueStr.replace(MONEY_PATTERN, (match, clp, ufPrefix, ufSuffix, usd) => {
    let sourceCurrency = 'CLP';
    let raw = clp;
    if (ufPrefix || ufSuffix) {
      sourceCurrency = 'UF';
      raw = ufPrefix || ufSuffix;
    } else if (usd) {
      sourceCurrency = 'USD';
      raw = usd;
    }

    const amount = parseNumber(raw);
    if (Number.isNaN(amount)) return match;

    const amountInCLP = toCLP(amount, sourceCurrency, exchangeRates);
    return formatCurrency(fromCLP(amountInCLP, targetCurrency, exchangeRates), targetCurrency);
  });
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
