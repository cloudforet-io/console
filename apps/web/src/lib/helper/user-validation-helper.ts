import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

export const emailValidator = (userId: string) => {
    if (userId === '') return false;
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    return !emailCheckRegex.test(userId);
};

export const passwordValidator = (password: string) => {
    if (password === '') return false;
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

export const postCheckDuplicateID = async (userId: string) => {
    if (userId === '') return false;
    try {
        await SpaceConnector.client.identity.user.list({ user_id: userId });
        return true;
    } catch (e) {
        return false;
    }
};

export const postCheckOauth = async (userId: string) => {
    if (userId === '') return false;
    try {
        await SpaceConnector.client.identity.user.find({
            search: { user_id: userId },
            domain_id: store.state.domain.domainId,
        });
        return true;
    } catch (e) {
        return false;
    }
};

