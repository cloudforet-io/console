import regions from '@/components/organisms/charts/d3/bubble-chart/aws-regions.json';

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
