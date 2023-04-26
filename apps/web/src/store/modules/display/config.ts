export const SIDEBAR_TYPE = Object.freeze({
    info: 'primary',
    handbook: 'secondary',
    widget: 'widget',
});
export type SidebarType = typeof SIDEBAR_TYPE[keyof typeof SIDEBAR_TYPE];
