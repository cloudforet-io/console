/**
 * @description Returns whether the service corresponds to a supported browser. Based on current Chrome or Edge.
 */
export const supportsBrowser = (): boolean => {
    const agent = window.navigator.userAgent.toLowerCase();
    const isWhale = agent.includes('whale');
    const isEdge = agent.includes('edge');
    const isAndroid = agent.includes('android');
    const isIphone = agent.includes('iphone');
    const isOpera = agent.includes('opr');
    const isBrave = agent.includes('brave');
    const isDesktopChrome = agent.includes('chrome') && !isWhale && !isAndroid && !isIphone && !isOpera && !isBrave;
    return (isDesktopChrome || isEdge);
};

export const isMobile = () => {
    const user = window.navigator.userAgent.toLowerCase();
    let _isMobile = false;

    if (user.includes('iphone')
        || user.includes('android')
        || user.includes('ipad')
        || user.includes('ipod')
    ) _isMobile = true;
    return _isMobile;
};
