import { logger } from '../utils/logger.js';

interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol?: string;
}

interface RestCountryResponse {
  name?: {
    common?: string;
    official?: string;
  };
  currencies?: Record<string, { name?: string; symbol?: string }>;
  cca2?: string;
  cca3?: string;
  altSpellings?: string[];
}

const rateCache = new Map<string, { rates: ExchangeRateResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  INR: { INR: 1, AED: 0.0442, EUR: 0.0109, USD: 0.012 },
  AED: { AED: 1, INR: 22.64, EUR: 0.246, USD: 0.272 },
  EUR: { EUR: 1, INR: 91.5, AED: 4.07, USD: 1.09 },
  USD: { USD: 1, INR: 83.25, AED: 3.67, EUR: 0.92 },
};

let countryCurrencyMap: Map<string, CurrencyInfo> | null = null;
const FALLBACK_COUNTRY_CURRENCIES = new Map<string, CurrencyInfo>([
  ['INDIA', { code: 'INR', name: 'Indian Rupee', symbol: '₹' }],
  ['IN', { code: 'INR', name: 'Indian Rupee', symbol: '₹' }],
  ['IND', { code: 'INR', name: 'Indian Rupee', symbol: '₹' }],
  ['UNITED ARAB EMIRATES', { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }],
  ['UAE', { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }],
  ['DE', { code: 'EUR', name: 'Euro', symbol: '€' }],
  ['GERMANY', { code: 'EUR', name: 'Euro', symbol: '€' }],
  ['US', { code: 'USD', name: 'US Dollar', symbol: '$' }],
  ['UNITED STATES', { code: 'USD', name: 'US Dollar', symbol: '$' }],
]);

const normalizeCountryIdentifier = (value: string): string => value.trim().toUpperCase();

export class CurrencyService {
  async getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    const cached = rateCache.get(baseCurrency);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.rates.rates;
    }

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = (await response.json()) as ExchangeRateResponse;

      rateCache.set(baseCurrency, {
        rates: data,
        timestamp: Date.now(),
      });

      return data.rates;
    } catch (error) {
      logger.error('Failed to fetch exchange rates', error);
      return FALLBACK_RATES[baseCurrency] ?? { [baseCurrency]: 1 };
    }
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ convertedAmount: number; exchangeRate: number }> {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, exchangeRate: 1 };
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates[toCurrency] || FALLBACK_RATES[fromCurrency]?.[toCurrency] || 1;

    return {
      convertedAmount: Math.round(amount * rate * 100) / 100,
      exchangeRate: rate,
    };
  }

  async getCountryCurrencyMap(): Promise<Map<string, CurrencyInfo>> {
    if (countryCurrencyMap) {
      return countryCurrencyMap;
    }

    try {
      const response = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,currencies,cca2,cca3,altSpellings'
      );

      if (!response.ok) {
        throw new Error(`RestCountries API error: ${response.status}`);
      }

      const countries = (await response.json()) as RestCountryResponse[];
      countryCurrencyMap = new Map();

      for (const country of countries) {
        if (!country.currencies) {
          continue;
        }

        const currencyCode = Object.keys(country.currencies)[0];
        const currencyData = country.currencies[currencyCode];

        if (!currencyCode || !currencyData) {
          continue;
        }

        const currencyInfo: CurrencyInfo = {
          code: currencyCode,
          name: currencyData.name || currencyCode,
          symbol: currencyData.symbol,
        };

        const lookupKeys = [
          country.name?.common,
          country.name?.official,
          country.cca2,
          country.cca3,
          ...(country.altSpellings || []),
        ]
          .filter((value): value is string => Boolean(value?.trim()))
          .map((value) => normalizeCountryIdentifier(value));

        for (const key of lookupKeys) {
          countryCurrencyMap.set(key, currencyInfo);
        }
      }

      return countryCurrencyMap;
    } catch (error) {
      logger.error('Failed to fetch country currencies', error);
      return new Map();
    }
  }

  async getCurrencyByCountry(countryCode: string): Promise<CurrencyInfo | null> {
    const map = await this.getCountryCurrencyMap();
    return (
      map.get(normalizeCountryIdentifier(countryCode)) ||
      FALLBACK_COUNTRY_CURRENCIES.get(normalizeCountryIdentifier(countryCode)) ||
      null
    );
  }

  async getCurrencyForCountry(countryName: string): Promise<CurrencyInfo | null> {
    return this.getCurrencyByCountry(countryName);
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK',
      'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR',
    ];
  }
}

export const currencyService = new CurrencyService();
