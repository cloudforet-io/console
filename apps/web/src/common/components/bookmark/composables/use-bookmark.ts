import { i18n } from '@/translations';

export const fetchFavicon = async (link: string): Promise<string|undefined> => {
    try {
        const baseURL = extractBaseURL(link);
        return `${baseURL}/favicon.ico`;
    } catch (e) {
        return undefined;
    }
};
const extractBaseURL = (url: string) => {
    const parser = document.createElement('a');
    parser.href = url;
    return `${parser.protocol}//${parser.host}`;
};

export const generateNewFolderName = (existingFolders) => {
    const folderNumbers = existingFolders
        .filter((n) => n.name.startsWith(i18n.t('HOME.FORM_NEW_FOLDER')))
        .map((n) => parseInt(n.name.replace(i18n.t('HOME.FORM_NEW_FOLDER'), '')) || 0)
        .sort((a, b) => a.name - b.name);

    for (let i = 1; i <= folderNumbers.length; i++) {
        if (!folderNumbers.includes(i)) {
            return `${i18n.t('HOME.FORM_NEW_FOLDER')}${i}`;
        }
    }

    return `${i18n.t('HOME.FORM_NEW_FOLDER')}${folderNumbers.length + 1}`;
};

export const convertUrlProtocol = (url: string): string => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `http://${trimmedUrl}`;
    }

    return trimmedUrl;
};

export const checkValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};
