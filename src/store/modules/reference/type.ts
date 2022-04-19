export interface ReferenceItem<Data = Record<string, any>> {
    label?: string;
    name?: string;
    color?: string;
    icon?: string;
    linkTemplate?: string;
    continent?: string;
    latitude?: string;
    longitude?: string;
    data?: Data;
}

export type ReferenceMap<Item extends ReferenceItem = ReferenceItem> = Record<string, Item>;

export interface ReferenceState<ReferenceMap = Record<string, any>> {
    items: ReferenceMap;
}
