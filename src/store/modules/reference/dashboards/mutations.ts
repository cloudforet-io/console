import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setDashboards = (state: ReferenceState, dashboards: ReferenceMap): void => {
    state.items = dashboards;
};
