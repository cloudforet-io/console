import axios from 'axios';

export const fetchFavicon = async (link: string): Promise<string|undefined> => {
    try {
        const baseURL = extractBaseURL(link);
        const response = await axios.get(baseURL);
        const faviconUrlValue = extractFaviconUrl(response.data);
        if (faviconUrlValue) {
            return `${baseURL}/${faviconUrlValue}`;
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
};
const extractBaseURL = (url: string) => {
    const parser = document.createElement('a');
    parser.href = url;
    return `${parser.protocol}//${parser.host}`;
};
const extractFaviconUrl = (html: string): string|undefined => {
    const faviconRegex = /<link.*?rel=["'](?:shortcut )?icon["'].*?href=["'](.*?)["'].*?>/i;
    const match = html.match(faviconRegex);
    if (match && match[1]) {
        return match[1];
    }
    return undefined;
};
