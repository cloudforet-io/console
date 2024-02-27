import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';

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

    constructor() {
        super();
        this._meta = GranularityVariableModel._meta;
    }
}
