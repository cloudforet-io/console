
export const emailValidator = (userId: string) => {
    if (userId === '') return false;
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return !emailCheckRegex.test(userId);
};

export const oneLowerCaseValidator = (valueForCheck: string) => valueForCheck.match(/[a-z]/);

export const oneUpperCaseValidator = (valueForCheck: string) => valueForCheck.match(/[A-Z]/);

export const oneNumberValidator = (valueForCheck: string) => valueForCheck.match(/[0-9]/);

export const samePasswordValidator = (originPasswordForCheck: string, newPasswordForCheck: string) => newPasswordForCheck === originPasswordForCheck;
