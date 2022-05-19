import { isEmpty, some } from 'lodash';

import config from '@/lib/config';

/**
 * @function
 * @name assetUrlConverter
 * @param src
 * @description Replace assets base url by config
 */
export const assetUrlConverter = (src: string) => {
    const endpoints = config.get('ASSET_PATH');
    if (isEmpty(endpoints) || !src) return src;

    let url = src;
    some(endpoints, (dest, origin) => {
        if (src.startsWith(origin)) url = src.replace(origin, dest);
        return src.startsWith(origin);
    });
    return url;
};
