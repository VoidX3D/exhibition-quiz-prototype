/**
 * Shuffles an array in place.
 * @param {Array} array An array containing the items.
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * Generates a random player name.
 * @returns {string} A random player name.
 */
function generateRandomName() {
    const adjectives = ['Quick', 'Bright', 'Smart', 'Fast', 'Clever', 'Witty'];
    const nouns = ['Jaguar', 'Eagle', 'Lion', 'Tiger', 'Panther', 'Leopard'];
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${randomNumber}`;
}
