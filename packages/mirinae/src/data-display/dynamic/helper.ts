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

export const getValueByPath = (data: any, path: string|null, depth?: number|null) => {
    if (typeof path !== 'string') return data;

    let target = data;
    let lastDepthKey;
    const pathArr = path.split('.');
    if (depth) {
        lastDepthKey = pathArr.splice(depth).join('.');
    }

    const pathCount = depth ?? pathArr.length;
    for (let i = 0; i < pathCount; i++) {
        if (target === undefined || target === null || typeof target !== 'object') return target;

        const currentPath = pathArr[i];

        if (typeof target === 'object') {
            target = getObjectValue(target, currentPath);
        }
    }
    return (depth && target) ? target[lastDepthKey] : target;
};
