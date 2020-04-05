export const serviceAccountsProps = {
    data: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: true,
    },
};

export interface ServiceAccountsPropsType {
    data: any[];
    loading: boolean;
}
