import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

export const getWidgetFilterDataKey = (filterKey: string) => {
    const resourceReference = REFERENCE_TYPE_INFO[filterKey];
    if (resourceReference) {
        return resourceReference.key;
    }
    return filterKey;
};
