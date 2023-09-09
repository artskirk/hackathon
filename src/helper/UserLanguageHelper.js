const userLanguage = {
    code: {
        ru: 'ru',
        en: 'en'
    },
    isRu: (text) => /[а-яё]/i.test(text),
    isLanguageCodeEn: (languageCode) => languageCode === userLanguage.code.en,
};

module.exports = { userLanguage };