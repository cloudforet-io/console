import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class GranularityVariableModel extends EnumVariableModel {
    static _meta = {
        key: 'granularity',
        name: 'Granularity',
    };

    values = [
        { key: 'DAILY', name: 'Daily' },
        { key: 'MONTHLY', name: 'Monthly' },
        { key: 'YEARLY', name: 'Yearly' },
    ];

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = GranularityVariableModel._meta;
    }
}
