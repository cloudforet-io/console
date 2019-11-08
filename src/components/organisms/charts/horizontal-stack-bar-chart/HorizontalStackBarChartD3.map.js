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
//
// export const SAMPLE_DATA = {
//     INSERVICE: Math.round(Math.random() * 10),
//     MAINTENANCE: Math.round(Math.random() * 10),
//     CLOSED: Math.round(Math.random() * 10),
// };


export const sampleDataGenerator = function () {
    const length = 1;//Math.round(Math.random() * 10) || 5;
    const arr = [];

    for (let i = 0; i < length; i++) {
        arr.push({
            apples: Math.round(Math.random() * 10),
            bananas: Math.round(Math.random() * 10),
            cherries: Math.round(Math.random() * 10),
            dates: Math.round(Math.random() * 10),
        });
    }
    return arr;
    // return [
    //     {
    //         apples: 15, bananas: 30, cherries: 24, dates: 2,
    //     },
    // ];
};
