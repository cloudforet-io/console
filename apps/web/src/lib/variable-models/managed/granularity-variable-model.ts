import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class GranularityVariableModel extends EnumVariableModel {
    key = 'granularity';

    name = 'Granularity';

    labels = ['cost', 'asset'] as VariableModelLabel[];

    values = [
        { key: 'DAILY', name: 'Daily' },
        { key: 'MONTHLY', name: 'Monthly' },
        { key: 'YEARLY', name: 'Yearly' },
    ];
}
