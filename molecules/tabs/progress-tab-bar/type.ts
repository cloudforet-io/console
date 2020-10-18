export interface ProgressTab {
    name: string;
    label?: string;
    help?: string;
    optional?: string;
}

interface State {
    [key: string]: boolean;
}

export interface ProgressTabBarProps {
    tabs: ProgressTab[];
    activeIdx: number;
    invalidState: State;
}
