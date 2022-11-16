export interface BoardItemProps {
    rounded?: boolean;
    leftIcon?: string;
    iconButtonSets?: IconSet[];
}

export type ButtonEventHandler = (...args: any[] | any) => Promise<void> | void;

export interface IconSet {
    iconName: string;
    eventAction: ButtonEventHandler;
}
