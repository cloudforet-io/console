import { timeZonesNames } from '@vvo/tzdb';

export const timezoneList = ['UTC'].concat(timeZonesNames);

export const languages = {
    en: 'English',
    ko: '한국어',
    jp: '日本語',
};

export const userTypes = {
    USER: 'User',
    DOMAIN_OWNER: 'Root Account',
    API_USER: 'API User',
};
