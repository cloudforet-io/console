export interface ResourceItem {
    label?: string;
    name?: string;
    color?: string;
    icon?: string;
    linkTemplate?: string;
    continent?: string;
    latitude?: string;
    longitude?: string;
}

export type ResourceMap = Record<string, ResourceItem>;

export interface ResourceState {
    items?: ResourceMap;
}
