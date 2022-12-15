// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Getter } from 'vuex';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardModel, DashboardState } from '@/store/modules/dashboard/type';

export const getDashboardCount: Getter<DashboardState, any> = (state): any => {
    const domainItemCount = state.domainItemCount;
    const projectItemCount = state.projectItemCount;
    return domainItemCount + projectItemCount;
};
export const getDomainItems: Getter<DashboardState, any> = (state): any => getItems(state.domainItems ?? [], state.searchFilters, state.viewers);
export const getProjectItems: Getter<DashboardState, any> = (state): any => getItems(state.projectItems ?? [], state.searchFilters, state.viewers);

const getItems = (items: DashboardModel[], filters: ConsoleFilter[], viewers: string): DashboardModel[] => {
    let result = items;
    if (viewers && viewers !== 'ALL') {
        result = result.filter((d) => d.viewers === viewers);
    }
    filters.forEach((d) => {
        if (d.k === 'label' && Array.isArray(d.v)) {
            d.v.forEach((value) => {
                result = result.filter((item) => item.labels.includes(value));
            });
        }
        if (!d.k && d.v) {
            result = result.filter((item) => item.name.includes(`${d.v}`));
        }
    });
    return result;
};
