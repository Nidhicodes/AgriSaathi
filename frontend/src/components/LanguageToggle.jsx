import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
];

const LanguageToggle = () => {
    const { i18n } = useTranslation();

    const currentLanguage = languages.find(lang => lang.code === i18n.language);
    const currentIndex = languages.findIndex(lang => lang.code === i18n.language);

    const toggleLanguage = () => {
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLangCode = languages[nextIndex].code;
        i18n.changeLanguage(nextLangCode);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white text-primary rounded-full font-semibold shadow-md hover:bg-gray-100 transition-colors"
        >
            {currentLanguage ? currentLanguage.name : 'Language'}
        </button>
    );
};

export default LanguageToggle;
