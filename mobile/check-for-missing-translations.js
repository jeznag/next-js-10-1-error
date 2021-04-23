const fs = require('fs');
const englishTranslationsRaw = fs.readFileSync('./mobile/public/static/locales/en/common.json');
const englishTranslations = JSON.parse(englishTranslationsRaw);

const otherTranslationFiles = [
    './mobile/public/static/locales/km/common.json',
    './mobile/public/static/locales/tl/common.json'
];

let hasMissingTranslations = false;
otherTranslationFiles.forEach((otherTranslationFile) => {
    const otherLanguageTranslationRaw = fs.readFileSync(otherTranslationFile);
    const otherLanguageTranslation = JSON.parse(otherLanguageTranslationRaw);

    Object.keys(englishTranslations).forEach((translationKey) => {
        if (!Object.keys(otherLanguageTranslation).includes(translationKey)) {
            console.log(`${otherTranslationFile} is missing ${translationKey}`);
            hasMissingTranslations = true;
        }
    });
})

if (hasMissingTranslations) {
    throw new Error('Missing translations');
}
