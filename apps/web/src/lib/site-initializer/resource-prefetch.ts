import { VariableModelFactory } from '@/lib/variable-models';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

interface PrefetchModelInfo {
    key: ManagedVariableModelKey;
    dataKey: string;
}

const PREFETCH_MODEL_INFO_LIST: PrefetchModelInfo[] = [
    { key: 'cost', dataKey: 'product' },
    { key: 'cost', dataKey: 'usage_type' },
];

export const prefetchResources = (userId: string|undefined) => {
    if (!userId) return;

    PREFETCH_MODEL_INFO_LIST.forEach((info) => {
        const model = new VariableModelFactory({
            type: 'MANAGED',
            managedModelKey: info.key,
        });
        if (info.dataKey) {
            console.debug('Prefetching', model, info.dataKey);
            model[info.dataKey].values();
        } else model[info.dataKey].list();
    });
};
