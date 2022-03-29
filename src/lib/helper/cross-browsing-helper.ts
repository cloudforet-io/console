/**
 * @description Returns whether the service corresponds to a supported browser. Based on current Chrome or Edge.
 */
export const supportsBrowser = () => {
    const agent = window.navigator.userAgent.toLowerCase();
    const isWhale = agent.includes('whale');
    const isEdge = agent.includes('edge');
    const isAndroid = agent.includes('android');
    const isIphone = agent.includes('iphone');
    const isOpera = agent.includes('opr');
    const isBrave = agent.includes('brave');
    const isDesktopChrome = agent.includes('chrome') && !isWhale && !isAndroid && !isIphone && isOpera && !isBrave;
    return (isDesktopChrome || isEdge);
};
