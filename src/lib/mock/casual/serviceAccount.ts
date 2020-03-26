/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
// eslint-disable-next-line import/no-cycle
import { modelType } from '@/lib/mock/casual';

const serviceAccount = (casual) => {
    casual.define('serviceAccount', () => ({
        service_account_id: casual.make_id('service-account'),
        name: casual.last_name,
        account_id: casual.word,
        project_id:casual.make_id('project'),
        created_at: casual.timestamp,
        domain_id: casual.make_id('domain'),
    }));
    return casual;
};


export interface serviceAccountCasual {
    serviceAccount?: any;
    _serviceAccount?: any;
}

const result: modelType[] = [
    serviceAccount,
];

export default result;
