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

// Cache for exchange rates (5 minute TTL)
const rateCache = new Map<string, { rates: ExchangeRateResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for country->currency mapping
let countryCurrencyMap: Map<string, CurrencyInfo> | null = null;

const normalizeCountryIdentifier = (value: string): string => value.trim().toUpperCase();

export class CurrencyService {
  async getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    const cached = rateCache.get(baseCurrency);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.rates.rates;
    }

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json() as ExchangeRateResponse;

      rateCache.set(baseCurrency, {
        rates: data,
        timestamp: Date.now(),
      });

      return data.rates;
    } catch (error) {
      logger.error('Failed to fetch exchange rates', error);
      // Return fallback with base rate of 1
      return { [baseCurrency]: 1 };
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
    const rate = rates[toCurrency] || 1;

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

      const countries = await response.json() as RestCountryResponse[];
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
      // Return empty map on error
      return new Map();
    }
  }

  async getCurrencyByCountry(countryCode: string): Promise<CurrencyInfo | null> {
    const map = await this.getCountryCurrencyMap();
    return map.get(normalizeCountryIdentifier(countryCode)) || null;
  }

  async getCurrencyForCountry(countryName: string): Promise<CurrencyInfo | null> {
    return this.getCurrencyByCountry(countryName);
  }

  async getSupportedCurrencies(): Promise<string[]> {
    // Common currencies
    return [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK',
      'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR',
    ];
  }
}

export const currencyService = new CurrencyService();
