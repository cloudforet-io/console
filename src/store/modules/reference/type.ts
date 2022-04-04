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

export type ReferenceMap<ReferenceItem = Record<string, any>> = Record<string, ReferenceItem>;

export interface ReferenceState<ReferenceMap = Record<string, any>> {
    items?: ReferenceMap;
}
