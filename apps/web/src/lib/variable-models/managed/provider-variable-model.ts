import { ResourceFieldVariableModel } from '@/lib/variable-models/_base/resource-field-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export class ProviderVariableModel extends ResourceFieldVariableModel {
    key = 'provider';

    name = 'Provider';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'identity.Provider';

    resourceId = 'provider';

    only = ['provider', 'name'];

    searchTargets = ['name'];

    // eslint-disable-next-line class-methods-use-this
    formatter(data: any) {
        return data.name;
    }
}
