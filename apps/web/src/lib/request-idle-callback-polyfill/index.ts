interface RequestIdleCallback {
    didTimeout?: boolean;
    // eslint-disable-next-line no-undef
    timeRemaining?(): DOMHighResTimeStamp;
}

type RequestIdleCallbackId = number;

export const initRequestIdleCallback = () => {
    window.requestIdleCallback = window.requestIdleCallback
    || ((cb: (deadline: RequestIdleCallback) => any) => {
        const start = Date.now();
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining() {
                    return Math.max(0, 50 - (Date.now() - start));
                },
            });
        }, 1);
    });

    window.cancelIdleCallback = window.cancelIdleCallback
    || ((id: RequestIdleCallbackId) => {
        clearTimeout(id);
    });
};
