export const emailValidator = (userId: string) => {
    if (userId === '') return false;
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return !emailCheckRegex.test(userId);
};

export const blankValidator = (str: string) => {
    if (str === '') {
        return false;
    }
    const blankCheckRegex = /\s/g;
    return blankCheckRegex.test(str);
};
