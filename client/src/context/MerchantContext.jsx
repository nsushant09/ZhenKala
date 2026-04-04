import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const MerchantContext = createContext();

export const MerchantProvider = ({ children }) => {
    const [merchantSettings, setMerchantSettings] = useState({
        businessName: 'ZhenKala',
        contactEmail: 'contact.zhenkala@gmail.com',
        contactPhone: '+977 9705428340',
        address: 'Thamel-12, Kathmandu, Nepal',
        deliveryCharges: {
            nepal: 130,
            international: 2000
        },
        freeShippingThreshold: 13000
    });
    const [loading, setLoading] = useState(true);

    const fetchMerchantSettings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/merchant-details');
            if (data) {
                setMerchantSettings({
                    ...data,
                    deliveryCharges: data.deliveryCharges || { nepal: 130, international: 2000 },
                    freeShippingThreshold: data.freeShippingThreshold || 13000
                });
            }
        } catch (error) {
            console.error('Error fetching merchant settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchantSettings();
    }, []);

    const value = {
        settings: merchantSettings,
        loading,
        refreshSettings: fetchMerchantSettings
    };

    return (
        <MerchantContext.Provider value={value}>
            {children}
        </MerchantContext.Provider>
    );
};

export const useMerchant = () => {
    const context = useContext(MerchantContext);
    if (!context) {
        throw new Error('useMerchant must be used within a MerchantProvider');
    }
    return context;
};
