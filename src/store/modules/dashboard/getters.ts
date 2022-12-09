// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Getter } from 'vuex';

import type { DashboardState, ScopeType } from '@/store/modules/dashboard/type';

export const getItems: Getter<DashboardState, any> = (state): any => (type: ScopeType, filters, viewers) => {
    let result = state[`${type.toLocaleLowerCase()}Items`];
    if (viewers && viewers !== 'ALL') {
        result = result?.filter((d) => d.viewers === viewers);
    }
    filters.forEach((d) => {
        if (d.k === 'label' && Array.isArray(d.v)) {
            d.v.forEach((value) => {
                result = result.filter((item) => item.labels.includes(value));
            });
        }
        if (!d.k && d.v) {
            result = result.filter((item) => item.name.includes(d.v));
        }
    });
    return result;
};
