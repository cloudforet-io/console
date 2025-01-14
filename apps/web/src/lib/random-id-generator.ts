const getRandomId = ():string => {
    try {
        if (window) return (window.crypto.getRandomValues(new Uint32Array(1))[0]).toString();
        throw new Error('No window object found');
    } catch (e) {
        console.error(e);
        return (Math.random()).toString();
    }
};

export default getRandomId;
