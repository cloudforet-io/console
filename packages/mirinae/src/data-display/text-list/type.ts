export type TextListItem = Array<string|object>;
export interface TextListProps {
    items: TextListItem[];
    delimiter: string;
    tag: string;
    subKey?: string;
    link?: string;
    target?: string;
    linkFormatter?: (item: TextListItem, index: number) => string;
}
