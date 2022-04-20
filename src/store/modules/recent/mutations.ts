import { RecentConfig, RecentState } from '@/store/modules/recent/type';


/* Menu */
export const addMenuItem = (state: RecentState, recent: RecentConfig): void => {
    state.menuItems.unshift(recent);
};
export const loadMenuItem = (state: RecentState, recent: RecentConfig[]): void => {
    state.menuItems = recent;
};

/* Project */
export const addProjectItem = (state: RecentState, recent: RecentConfig): void => {
    state.projectItems.unshift(recent);
};
export const loadProjectItem = (state: RecentState, recent: RecentConfig[]): void => {
    state.projectItems = recent;
};


/* Project Group */
export const addProjectGroupItem = (state: RecentState, recent: RecentConfig): void => {
    state.projectGroupItems.unshift(recent);
};
export const loadProjectGroupItem = (state: RecentState, recent: RecentConfig[]): void => {
    state.projectGroupItems = recent;
};

/* Cloud Service Type */
export const addCloudServiceItem = (state: RecentState, recent: RecentConfig): void => {
    state.cloudServiceItems.unshift(recent);
};
export const loadCloudServiceItem = (state: RecentState, recent: RecentConfig[]): void => {
    state.cloudServiceItems = recent;
};
