const format = {
    removeExtraSpaces: (msg) => msg.replace(/\s+/g, ' ').trim(),
    getRandomNumber: () => Math.floor(Math.random() * 7) + 3,
    isInputOutOfLimit: (inputString, limit) => {
        const words = inputString.trim().split(/\s+/);
        return words.length > limit;
    },
    getAmountOfWordsFromTheBeginning: (inputString, len) => inputString.trim().split(/\s+/).slice(0, len).join(' ') + '...',
    validateRange: (value, minRange, maxRange) => {
        const numericValue = Number(value);
        return numericValue >= minRange && numericValue <= maxRange;
    }
};

module.exports = { format };