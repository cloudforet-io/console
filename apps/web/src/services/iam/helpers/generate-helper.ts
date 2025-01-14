export const generatePassword = () => {
    const allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12}$/;

    let randomPassword = '';

    do {
        randomPassword = Array.from({ length: 12 }, () => allCharacters[Math.floor(Math.random() * allCharacters.length)]).join('');
    } while (!regex.test(randomPassword));

    return randomPassword;
};
