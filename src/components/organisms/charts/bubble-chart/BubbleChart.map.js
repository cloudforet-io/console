import regions from './aws-regions.json';

export const BUBBLE_OPTIONS = Object.freeze({
    bubble: {
        maxRadius: 30,
    },
});

export const sampleDataGenerator = function () {
    const regionKeys = Object.keys(regions);
    const length = Math.round(Math.random() * regionKeys.length) || 5;
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push({
            key: regionKeys[i],
            value: Math.round(Math.random() * 10),
            longitude: regions[regionKeys[i]].longitude,
            latitude: regions[regionKeys[i]].latitude,
        });
    }
    return arr;
};
