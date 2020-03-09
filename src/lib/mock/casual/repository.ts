/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
// eslint-disable-next-line import/no-cycle
import { modelType } from '@/lib/mock/casual';


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

export interface repositoryCasual {
    repository?: any;
    _repository?: any;
}

const result: modelType[] = [
    repository,
];

export default result;
