export const HORIZONTAL_STACK_OPTIONS = Object.freeze({
    responsive: {
        width: true,
        height: false,
        preserveAspectRatio: false,
    },
    scales: {
        display: false,
    },
    labels: {
        padTop: 16,
        textHeight: 16,
    },
    bars: {
        thickness: 24,
        backBar: {
            display: true,
        },
    },
});


export const sampleDataGenerator = function () {
    const getObj = () => ({
        apples: Math.round(Math.random() * 10),
        bananas: Math.round(Math.random() * 10),
        cherries: Math.round(Math.random() * 10),
        dates: Math.round(Math.random() * 10),
    });
    const arr = [];
    const length = Math.round(Math.random() * 5) || 1;
    for (let i = 0; i < length; i++) {
        arr.push(getObj());
    }
    return arr;
};
