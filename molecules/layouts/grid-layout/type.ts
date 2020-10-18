export interface GridLayoutProps {
    items?: any[];
    cardMinWidth?: string;
    cardMaxWidth?: string;
    cardHeight?: string;
    rowGap?: string;
    fixColumn?: number;
    columnGap?: string;
    cardClass?: (...args: any[]) => any;
    cardStyle?: (...args: any[]) => any;
}
