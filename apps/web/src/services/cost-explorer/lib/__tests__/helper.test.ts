import { describe, expect } from 'vitest';

import { GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getRefinedCostQueryOptions } from '@/services/cost-explorer/lib/helper';
import type { CostQuerySetOption } from '@/services/cost-explorer/type';

const OLD_OPTIONS: Partial<CostQuerySetOption> = {
    group_by: [GROUP_BY.PROJECT_GROUP, GROUP_BY.PROJECT],
    primary_group_by: GROUP_BY.PROJECT,
    more_group_by: [
        { category: MORE_GROUP_BY.TAGS, key: 'Name', selected: true },
        { category: MORE_GROUP_BY.TAGS, key: 'Environment', selected: false },
        { category: MORE_GROUP_BY.ADDITIONAL_INFO, key: 'raw_usage_type', selected: false },
    ],
};

// const NEW_OPTIONS: Partial<CostQuerySetOption> = {
//     group_by: [GROUP_BY.PROJECT, GROUP_BY.PROJECT_GROUP, `${MORE_GROUP_BY.TAGS}.Name`],
// };
describe('getRefinedCostQueryOptions(): Convert old cost query options(<1.10.5) to new options(>=1.10.5)', () => {
    const refinedOptions = getRefinedCostQueryOptions(OLD_OPTIONS);

    it('Refined options doesn\'t have primary_group_by and more_group_by properties.', () => {
        expect(refinedOptions.primary_group_by).toBeFalsy();
        expect(refinedOptions.more_group_by).toBeFalsy();
    });

    it('Refined options\' group_by must include selected more_group_by string.', () => {
        const refinedGroupBy = refinedOptions.group_by as string[];
        expect(refinedGroupBy.includes(`${MORE_GROUP_BY.TAGS}.Name`)).toBeTruthy();
    });

    it('Refined options\' group_by\'s first item must be primary_group_by.', () => {
        const refinedGroupBy = refinedOptions.group_by as string[];
        expect(refinedGroupBy[0] === OLD_OPTIONS.primary_group_by).toBeTruthy();
    });
});

