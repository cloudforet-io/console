/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
import { ModelType } from '@/lib/mock/casual/type';


const repository = (casual) => {
    casual.define('repository', () => ({
        repository_id: casual.make_id('repository'),
        name: casual.word,
        repository_type: 'remote',
        endpoint: casual.url,
        version: `v${casual.integer(1, 5)}`,
        credential_id: casual.make_id('credential'),
        created_at: casual._timestamp,
    }));
    return casual;
};

export interface RepositoryCasual {
    repository?: any;
    _repository?: any;
}

const result: ModelType[] = [
    repository,
];

export default result;
