import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class UserVariableModel extends ResourceNameVariableModel {
    key = 'user';

    name = 'User';

    labels: VariableModelLabel[] = [];

    resourceType = 'identity.User';

    idKey = 'user_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
