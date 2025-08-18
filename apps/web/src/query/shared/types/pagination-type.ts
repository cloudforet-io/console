export type PaginatableBaseData = {
    results?: any[];
    more?: boolean; // for 'analyze' verb without 'total_count'
    total_count?: number;
};
