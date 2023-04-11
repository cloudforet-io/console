import { flatten } from 'lodash';

const getObjectValue = (target: Record<string, any>|Array<any>, currentPath: string) => {
    if (Array.isArray(target)) {
        if (Number.isNaN(Number(currentPath))) {
            return flatten(target.map((d) => {
                if (typeof d === 'object') return getObjectValue(d, currentPath);
                return d;
            }));
        }
        return target[Number(currentPath)];
    }
    return target[currentPath];
};

export const getValueByPath = (data: any, path: string|null) => {
    if (typeof path !== 'string') return data;

    let target = data;
    const pathArr = path.split('.');

    for (let i = 0; i < pathArr.length; i++) {
        if (target === undefined || target === null || typeof target !== 'object') return target;

        const currentPath = pathArr[i];

        if (typeof target === 'object') {
            target = getObjectValue(target, currentPath);
        }
    }
    return target;
};

// const test: any[] = [];
// if (test.length === 0) {
//     test.push(getValueByPath([
//         {
//             v: [
//                 {
//                     p: [
//                         { d: 1 },
//                         { d: 2 },
//                     ],
//                 }, {
//                     p: [
//                         { d: 3 },
//                         { d: 4 },
//                     ],
//                 },
//             ],
//         },
//         {
//             v: [
//                 {
//                     p: [
//                         { d: 5 },
//                         { d: 6 },
//                     ],
//                 }, {
//                     p: [
//                         { d: 7 },
//                     ],
//                 },
//             ],
//         },
//     ], 'v.p.d'));
//
//     test.push(getValueByPath([{
//         v: [
//             {
//                 p: [
//                     [{ d: 1 }, { d: 2 }],
//                     [{ d: 3 }, { d: 4 }],
//                 ],
//             }, {
//                 p: [
//                     [{ d: 5 }, { d: 6 }],
//                     [{ d: 7 }],
//                     [{ d: 8 }],
//                 ],
//             },
//         ],
//     }], 'v.p.d'));
//
//     test.push(getValueByPath([{
//         v: [
//             {
//                 p: [
//                     [{ d: 1 }, { d: 2 }],
//                     [{ d: 3 }, { d: 4 }],
//                 ],
//             }, {
//                 p: [
//                     [{ d: 5 }, { d: 6 }],
//                     [{ d: 7 }],
//                     [{ d: 8 }],
//                 ],
//             },
//         ],
//     }], 'v.p'));
//
//     test.push(getValueByPath([{
//         v: [
//             {
//                 p: [
//                     [{ d: 1 }, { d: 2 }],
//                     [{ d: 3 }, { d: 4 }],
//                 ],
//             }, {
//                 p: [
//                     [{ d: 5 }, { d: 6 }],
//                     [{ d: 7 }],
//                     [{ d: 8 }],
//                 ],
//             },
//         ],
//     }], 'v.p.0.d'));
//     console.debug('test', test);
// }
