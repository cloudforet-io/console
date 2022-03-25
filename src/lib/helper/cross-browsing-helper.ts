/**
 * @description Returns whether the service corresponds to a supported browser. Based on current Chrome or Edge.
 */
export const supportsBrowser = () => {
    const agent = window.navigator.userAgent.toLowerCase();
    const isWhale = agent.includes('whale');
    const isEdge = agent.includes('edge');
    const isChrome = agent.includes('chrome') && !isWhale;
    return (isChrome || isEdge);
};
