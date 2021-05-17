export enum SIDEBAR_STYLE_TYPE {
    primary = 'primary',
    secondary = 'secondary'
}

export type SidebarStyleType = keyof SIDEBAR_STYLE_TYPE;

export interface SidebarProps {
    visible: boolean;
    title: string;
    styleType: SidebarStyleType;
}