import type { RecentConfig, RecentState } from '@/store/modules/recent/type';

/* Menu */
export const addMenuItem = (state: RecentState, recent: RecentConfig): void => {
    const exist = state.menuItems.find((d) => d.itemId === recent.itemId);
    if (exist) {
        state.menuItems = state.menuItems.filter((d) => d.itemId !== recent.itemId);
    }
    state.menuItems.unshift(recent);
};
export const setMenuItems = (state: RecentState, recent: RecentConfig[]): void => {
    state.menuItems = recent;
};

/* Project */
export const addProjectItem = (state: RecentState, recent: RecentConfig): void => {
    const exist = state.projectItems.find((d) => d.itemId === recent.itemId);
    if (exist) {
        state.projectItems = state.projectItems.filter((d) => d.itemId !== recent.itemId);
    }
    state.projectItems.unshift(recent);
};
export const setProjectItems = (state: RecentState, recent: RecentConfig[]): void => {
    state.projectItems = recent;
};

/* Project Group */
export const addProjectGroupItem = (state: RecentState, recent: RecentConfig): void => {
    const exist = state.projectGroupItems.find((d) => d.itemId === recent.itemId);
    if (exist) {
        state.projectGroupItems = state.projectGroupItems.filter((d) => d.itemId !== recent.itemId);
    }
    state.projectGroupItems.unshift(recent);
};
export const setProjectGroupItems = (state: RecentState, recent: RecentConfig[]): void => {
    state.projectGroupItems = recent;
};

/* Cloud Service Type */
export const addCloudServiceItem = (state: RecentState, recent: RecentConfig): void => {
    const exist = state.cloudServiceItems.find((d) => d.itemId === recent.itemId);
    if (exist) {
        state.cloudServiceItems = state.cloudServiceItems.filter((d) => d.itemId !== recent.itemId);
    }
    state.cloudServiceItems.unshift(recent);
};
export const setCloudServiceItems = (state: RecentState, recent: RecentConfig[]): void => {
    state.cloudServiceItems = recent;
};

/* Dashboard Type */
export const addDashboardItem = (state: RecentState, recent: RecentConfig): void => {
    const exist = state.dashboardItems.find((d) => d.itemId === recent.itemId);
    if (exist) {
        state.dashboardItems = state.dashboardItems.filter((d) => d.itemId !== recent.itemId);
    }
    state.dashboardItems.unshift(recent);
};
export const setDashboardItems = (state: RecentState, recent: RecentConfig[]): void => {
    state.dashboardItems = recent;
};

/* All Type */
export const loadAllItem = (state: RecentState, recent: RecentConfig[]): void => {
    state.allItems = recent;
};
