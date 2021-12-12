export interface ResourceItem<Data = Record<string, any>> {
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

export type ResourceMap<ResourceItem = Record<string, any>> = Record<string, ResourceItem>;

export interface ResourceState<ResourceMap = Record<string, any>> {
    items?: ResourceMap;
}
