// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Getter } from 'vuex';

import { getTextHighlightRegex } from '@spaceone/design-system';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardState } from '@/store/modules/dashboard/type';

import type { DashboardModel } from '@/services/dashboards/model';

export const getDomainDashboardCount: Getter<DashboardState, any> = (state): any => state.domainItemCount;
export const getProjectDashboardCount: Getter<DashboardState, any> = (state): any => state.projectItemCount;

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
                if (typeof value === 'string') {
                    result = result.filter((item) => item.labels.includes(value));
                }
            });
        } else if (!d.k && d.v) {
            if (typeof d.v === 'string') {
                const regex = getTextHighlightRegex(d.v);
                result = result.filter((item) => regex.test(item.name));
            }
        }
    });
    return result;
};

export const getDashboardNameList: Getter<DashboardState, any> = (state, getters): any => (projectId: string, dashboardName: string) => {
    if (projectId) {
        return getters.getProjectItems
            .filter((item) => (
                item.project_id === projectId)
                && item.name !== dashboardName)
            .map((_item) => _item.name);
    }
    return getters.getDomainItems.map((item) => {
        if (item.name !== dashboardName) return item.name;
        return '';
    });
};
