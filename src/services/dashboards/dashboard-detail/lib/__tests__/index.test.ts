import { expect } from 'vitest';

import { widgetFrameWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/helper';

function permutation(arr, selectNum) {
    const result: Array<string> = [];
    if (selectNum === 1) return arr.map((v) => [v]);

    arr.forEach((v, idx, arr2) => {
        const fixed = v;
        const restArr = arr2;
        const permutationArr = permutation(restArr, selectNum - 1);
        const combineFix: Array<string> = permutationArr.map((v2) => [fixed, ...v2]);
        result.push(...combineFix);
    });
    return result;
}

describe('Select Permutation', () => {
    // more than 10, call stack boom
    const __SELECT_AMOUNT__ = 4;
    const __CONTAINER_WIDTH__ = 1360;

    const selectedPermutation: Array<Array<string>> = permutation(['SM', 'MD', 'LG', 'XL', 'FULL'], __SELECT_AMOUNT__);

    it('Select 5Pi3', () => {
        expect(selectedPermutation.length).toBe(5 ** __SELECT_AMOUNT__);
    });

    console.log(selectedPermutation[0]);
    it('1360px', () => {
        let cnt = 0;
        widgetFrameWidthAssigner(selectedPermutation[0], __CONTAINER_WIDTH__).forEach((d) => { cnt += d.length; });
        expect(cnt).toBe(4);
    });
});
