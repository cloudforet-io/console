import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { StatQueryAPI, StatResponse } from '@/lib/fluent-api/statistics/toolset';


/*
EXAMPLE:

1.
const query = {
    service_type: 'inventory.cloud-service',
    fields: [{
        key: 'cloud_service_id',
        operator: OPERATORS.count,
        alias: 'count',
    }, {
        key: 'cloud_service_type',
        operator: OPERATORS.value,
        alias: 'name',
    }, {
        key: 'provider',
        operator: OPERATORS.value,
        alias: 'provider',
    }, {
        key: 'cloud_service_group',
        operator: OPERATORS.value,
        alias: 'group',
    }],
    group_by: ['provider', 'cloud_service_group'],
    limit: 12,
}

interface Response {
    count: number;
    id: string;
    provider: string;
    group: string;
}

fluentApi.statistics().stat().query<Response>(query)


2.
interface Response {
    count: number;
    id: string;
    provider: string;
    group: string;
}

fluentApi.statistics().stat().query<Response>()
    .setServiceType('inventory.cloud-service')
    .addField('cloud_service_id', OPERATORS.count, 'count')
    .addField('cloud_service_type', OPERATORS.value, 'name')
    .addField('provider', OPERATORS.value, 'provider')
    .addField('cloud_service_group', OPERATORS.value, 'group')
    .setGroupBy('provider', 'cloud_service_group')
    .setLimit(12)
 */

class Query<value> extends StatQueryAPI<undefined, StatResponse<value>> {
    path = 'query'
}


export default class Stat extends Resource implements ResourceActions<'query'> {
    name = 'stat'

    query<value>(): Query<value> { return new Query<value>(this.baseUrl); }
}
