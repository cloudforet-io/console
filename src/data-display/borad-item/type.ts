export interface BoardItemProps {
    rounded: boolean;
    leftIcon: string;
    rightOverlayIconActions: IconAction[];
}

export type ButtonEventHandler = (...args: any[] | any) => Promise<void> | void;

export interface IconAction {
    iconName: string;
    eventAction: ButtonEventHandler;
}
