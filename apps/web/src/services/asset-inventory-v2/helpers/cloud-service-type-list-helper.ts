import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

const cloudServiceTypeQuery = new ApiQueryHelper()
    .setOnly('cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'is_primary', 'resource_type', 'cloud_service_type_key')
    .setMultiSort([{ key: 'is_primary', desc: true }, { key: 'name', desc: false }]);
export const getCloudServiceTypeQuery = (provider: string, group: string): Query => {
    cloudServiceTypeQuery.setFilters([
        { k: 'provider', v: provider, o: '=' },
        { k: 'group', v: group, o: '=' },
    ]);
    return cloudServiceTypeQuery.data;
};
