export const emailValidator = (userId: string) => {
    if (userId === '') return false;
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return !emailCheckRegex.test(userId);
};
