export interface ReferenceItem<Data = Record<string, any>> {
    label?: string;
    name?: string;
    color?: string;
    icon?: string;
    linkTemplate?: string;
    continent?: {
        continent_code?: string;
        continent_label?: string;
        latitude?: number;
        longitude?: number;
    };
    latitude?: string;
    longitude?: string;
    data?: Data;
}

export type ReferenceMap<Item extends ReferenceItem = ReferenceItem> = Record<string, Item>;

export interface ReferenceState<ReferenceMap = Record<string, any>> {
    items: ReferenceMap;
}
