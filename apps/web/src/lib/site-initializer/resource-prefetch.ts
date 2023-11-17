import { VariableModel } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

export const prefetchResources = () => {
    Object.values(MANAGED_VARIABLE_MODEL_CONFIGS).forEach((config) => {
        if (config.prefetch) {
            const model = new VariableModel({ type: 'MANAGED', key: config.key });
            model.list();
        }
    });
};
