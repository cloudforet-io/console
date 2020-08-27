export interface ResourceItem {
    label?: string;
    color?: string;
    icon?: string;
}

export type ResourceMap = Record<string, ResourceItem>;

export interface ResourceState {
    items?: ResourceMap;
}
