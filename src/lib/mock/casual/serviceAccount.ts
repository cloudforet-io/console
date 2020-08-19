/* eslint-disable camelcase */
import { ModelType } from '@/lib/mock/casual/type';

const serviceAccount = (casual) => {
    casual.define('serviceAccount', () => ({
        service_account_id: casual.make_id('service-account'),
        name: casual.last_name,
        account_id: casual.word,
        project_id: casual.make_id('project'),
        created_at: casual.timestamp,
        domain_id: casual.make_id('domain'),
    }));
    return casual;
};


export interface ServiceAccountCasual {
    serviceAccount?: any;
    _serviceAccount?: any;
}

const result: ModelType[] = [
    serviceAccount,
];

export default result;
