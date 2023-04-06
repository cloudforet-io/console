export const emailValidator = (userID: string) => {
    if (userID === '') {
        return false;
    }
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return emailCheckRegex.test(userID);
};

export const passwordValidator = (password: string) => {
    if (password === '') {
        return false;
    }
    // 최소 8자 & 영문 대문자1, 소문자1, 숫자1 포함
    const passwordCheckRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordCheckRegex.test(password);
};

export const blankValidator = (str: string) => {
    if (str === '') {
        return false;
    }
    const blankCheckRegex = /\s/g;
    return !blankCheckRegex.test(str);
};

