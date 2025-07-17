
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

export function createResourceIdResolver<T>(resourceKey: ResourceKeyType): (item: T) => string {
    const config = RESOURCE_CONFIG_MAP[resourceKey];

    if (!config || !config.idKey) {
        throw new Error(`[createResourceIdResolver] Invalid or missing idKey for resource key: "${resourceKey}"`);
    }

    return (item: T): string => {
        const id = item[config.idKey];
        if (typeof id !== 'string') {
            throw new Error(`[createResourceIdResolver] Expected string id for resource "${resourceKey}", got: ${typeof id}`);
        }
        return id;
    };
}

