import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

// New API: https://woxy-sensei.github.io/currency-api/
// Only supports 31 national currencies, no crypto.
const BASE_URL = 'https://raw.githubusercontent.com/WoXy-Sensei/currency-api/main/api';

const SUPPORTED_CURRENCIES = {
    USD: { name: 'US Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'Fr' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    SEK: { name: 'Swedish Krona', symbol: 'kr' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
    PHP: { name: 'Philippine Peso', symbol: '₱' },
    IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
    THB: { name: 'Thai Baht', symbol: '฿' },
    TRY: { name: 'Turkish Lira', symbol: '₺' },
    MXN: { name: 'Mexican Peso', symbol: '$' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    ILS: { name: 'Israeli New Shekel', symbol: '₪' },
    ISK: { name: 'Icelandic Króna', symbol: 'kr' },
    PLN: { name: 'Polish Złoty', symbol: 'zł' },
    DKK: { name: 'Danish Krone', symbol: 'kr' },
    NOK: { name: 'Norwegian Krone', symbol: 'kr' },
    HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
    CZK: { name: 'Czech Koruna', symbol: 'Kč' },
    RON: { name: 'Romanian Leu', symbol: 'lei' },
    BGN: { name: 'Bulgarian Lev', symbol: 'лв' },
};

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem('selectedCurrency') || 'USD';
    });
    const [rate, setRate] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchRate = useCallback(async (toCode) => {
        if (toCode === 'USD') {
            setRate(1);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/USD_${toCode}.json`);
            if (!response.ok) throw new Error('Failed to fetch rate');
            const data = await response.json();
            setRate(data.rate);
        } catch (error) {
            console.error(`Error fetching conversion rate for ${toCode}:`, error);
            // Revert or stay at 1 if failed
            setRate(1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRate(selectedCurrency);
    }, [selectedCurrency, fetchRate]);

    const changeCurrency = (code) => {
        setSelectedCurrency(code);
        localStorage.setItem('selectedCurrency', code);
    };

    const formatPrice = useCallback((amountUSD) => {
        const amount = Number(amountUSD) || 0;
        const converted = amount * rate;
        const currencyInfo = SUPPORTED_CURRENCIES[selectedCurrency] || { symbol: selectedCurrency };

        return `${currencyInfo.symbol} ${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }, [rate, selectedCurrency]);

    const convert = useCallback((amountUSD) => {
        return (Number(amountUSD) || 0) * rate;
    }, [rate]);

    const value = {
        currencies: SUPPORTED_CURRENCIES,
        selectedCurrency,
        changeCurrency,
        formatPrice,
        convert,
        symbol: (SUPPORTED_CURRENCIES[selectedCurrency] || {}).symbol || selectedCurrency,
        loading
    };

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyContext;
