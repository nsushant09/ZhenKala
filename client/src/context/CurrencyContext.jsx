import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

// Common symbols mapping, defaults to code if not present
export const CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$',
    CHF: 'Fr', CNY: '¥', SEK: 'kr', NZD: 'NZ$', SGD: 'S$',
    HKD: 'HK$', INR: '₹', BRL: 'R$', ZAR: 'R', PHP: '₱',
    IDR: 'Rp', MYR: 'RM', THB: '฿', TRY: '₺', MXN: '$',
    KRW: '₩', ILS: '₪', ISK: 'kr', PLN: 'zł', DKK: 'kr',
    NOK: 'kr', HUF: 'Ft', CZK: 'Kč', RON: 'lei', BGN: 'лв'
};

// Fallback supported currencies for UI stability
export const SUPPORTED_CURRENCIES = {
    USD: { name: 'US Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' }
};

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem('selectedCurrency') || 'USD';
    });
    const [rates, setRates] = useState({ USD: 1 });
    const [currencies, setCurrencies] = useState({ USD: { name: 'US Dollar', symbol: '$' } });
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/currencies/rates');
            if (data && data.rates && data.names) {
                setRates(data.rates);

                // Construct currencies object for dropdown
                const currencyMap = {};
                Object.keys(data.names).forEach(code => {
                    currencyMap[code] = {
                        name: (data.names[code] || '').trim(), // Trim value as requested
                        symbol: CURRENCY_SYMBOLS[code] || code
                    };
                });
                setCurrencies(currencyMap);
            }
        } catch (error) {
            console.error('Error fetching currency data from backend:', error);
            // Fallback is already set in initial state
        } finally {
            setLoading(false);
        }
    }, []);

    // Detect user's local currency based on IP (Run just once)
    const detectCurrency = useCallback(async () => {
        // Prevent re-detection in same session or if already detected/manually set
        if (sessionStorage.getItem('currencyDetected') || localStorage.getItem('selectedCurrencyManual')) return;

        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data && data.currency) {
                console.log(`🌍 Detected local currency: ${data.currency} (${data.country_name})`);
                setSelectedCurrency(data.currency);
                localStorage.setItem('selectedCurrency', data.currency);
            }
        } catch (err) {
            console.warn('Geolocation detection skipped or failed:', err.message);
        } finally {
            sessionStorage.setItem('currencyDetected', 'true');
        }
    }, []);

    useEffect(() => {
        fetchAllData();
        detectCurrency();
    }, [fetchAllData, detectCurrency]);

    const changeCurrency = (code) => {
        setSelectedCurrency(code);
        localStorage.setItem('selectedCurrency', code);
        localStorage.setItem('selectedCurrencyManual', 'true'); // Flag to prevent auto-detection override
    };

    const nprRate = rates['NPR'] || 1;
    const currentRate = rates[selectedCurrency] || 1;

    const formatPrice = useCallback((amountNPR) => {
        const amount = Number(amountNPR) || 0;
        // Convert from NPR to Selected Currency: (Amount / Rate_NPR) * Rate_Selected
        const converted = (amount / nprRate) * currentRate;
        const currencyInfo = currencies[selectedCurrency] || { symbol: selectedCurrency };

        return `${currencyInfo.symbol} ${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }, [currentRate, nprRate, selectedCurrency, currencies]);

    const convert = useCallback((amountNPR) => {
        return (Number(amountNPR) || 0) * (currentRate / nprRate);
    }, [currentRate, nprRate]);

    const value = {
        currencies,
        selectedCurrency,
        changeCurrency,
        formatPrice,
        convert,
        symbol: (currencies[selectedCurrency] || {}).symbol || selectedCurrency,
        loading
    };

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyContext;
