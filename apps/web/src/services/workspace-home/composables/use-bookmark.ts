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
