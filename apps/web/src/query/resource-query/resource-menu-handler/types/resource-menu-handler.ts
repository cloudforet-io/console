type ResourceMenuValue<T> = {
    name: string;
    label: string;
    data?: T;
};

export interface ResourceMenuResponse<T> {
    results: ResourceMenuValue<T>[];
    more?: boolean;
}
