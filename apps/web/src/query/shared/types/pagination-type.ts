export type PaginatableBaseData<T extends Record<string, any>> = {
    results?: T[];
    more?: boolean; // for 'analyze' verb without 'total_count'
    total_count?: number;
};
