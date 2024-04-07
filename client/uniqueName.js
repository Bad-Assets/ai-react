const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }); // big_red_donkey

const generateUniqueName = () => {
    let randomName = uniqueNamesGenerator();
    console.log(randomName);
    return randomName;
}

module.exports = generateUniqueName;