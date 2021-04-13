export const getValueByPath = (data: any, path: string) => {
    let target = data;
    const pathArr = path.split('.');

    for (let i = 0; i < pathArr.length; i++) {
        if (target === undefined || target === null || typeof target !== 'object') return target;

        const currentPath = pathArr[i];

        if (Array.isArray(target)) {
            if (Number.isNaN(Number(currentPath))) {
                target = target.map((d) => {
                    if (typeof d !== 'object') return d;
                    return d[currentPath];
                });
            } else {
                target = target[Number(currentPath)];
            }
        } else {
            target = target[currentPath];
        }
    }

    return target;
};
