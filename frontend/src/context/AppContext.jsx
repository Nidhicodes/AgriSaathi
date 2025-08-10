import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [pincode, setPincode] = useState('110001');
    const [locationDetails, setLocationDetails] = useState({
        district: 'New Delhi',
        state: 'Delhi'
    });
    const [weather, setWeather] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('en'); 

    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    const getWelcomeMessage = (lang) => {
        switch (lang) {
            case 'hi':
                return "नमस्ते! मैं एग्री-सारथी हूँ। अपना पिनकोड सेट करके आरंभ करें।";
            case 'mr-IN':
                return "नमस्कार! मी ऍग्री-सारथी आहे. कृपया तुमचा पिनकोड सेट करून प्रारंभ करा.";
            default:
                return "Welcome to AgriSaathi! Please set your pincode to get started.";
        }
    };

    useEffect(() => {
        if (chats.length === 0) {
            const newChatId = uuidv4();
            setChats([
                {
                    id: newChatId,
                    messages: [{
                        sender: 'ai',
                        text: getWelcomeMessage(language)
                    }]
                }
            ]);
            setActiveChatId(newChatId);
        }
    }, [language]); 

    const updatePincode = async (newPincode) => {
        if (!newPincode || newPincode.length !== 6) {
            setError("Please enter a valid 6-digit pincode.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            
            const location = await api.getLocationDetails(newPincode);
            
            setPincode(newPincode);
            setLocationDetails(location);

            const [weather, market] = await Promise.all([
                api.getWeather(newPincode),
                api.getMarketData(newPincode)
            ]);

            setWeather(weather);
            setMarketData(market.market_data || []); 
        } catch (err) {
            setError(err.message || "Failed to fetch data for the new pincode.");
            setLocationDetails(null);
            setWeather(null);
            setMarketData([]);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        const newChatId = uuidv4();
        const welcomeMessages = {
            'en': "Welcome again! How can I help you?",
            'hi': "फिर से स्वागत है! मैं आपकी क्या मदद कर सकता हूँ?",
            'mr-IN': "पुन्हा स्वागत आहे! मी तुमची कशी मदत करू शकतो?",
        };
        const newChat = {
            id: newChatId,
            messages: [{
                sender: 'ai',
                text: welcomeMessages[language] || welcomeMessages['en']
            }]
        };
        setChats(prevChats => [...prevChats, newChat]);
        setActiveChatId(newChatId);
    };

    const addMessageToChat = (message) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, messages: [...chat.messages, message] }
                    : chat
            )
        );
    };
    
    const activeChat = chats.find(chat => chat.id === activeChatId);

    const value = {
        pincode,
        setPincode,
        locationDetails,
        setLocationDetails,
        weather,
        setWeather,
        marketData,
        setMarketData,
        error,
        setError,
        loading,
        updatePincode,
        language,
        setLanguage,
        chats,
        activeChatId,
        activeChat,
        setActiveChatId,
        startNewChat,
        addMessageToChat
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};