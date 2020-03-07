/* eslint-disable camelcase */
import { arrayOf } from '@/lib/casual';
// eslint-disable-next-line import/no-cycle
import { modelType } from '@/lib/mock/casual';

const credentialGroup = (casual) => {
    casual.define('credentialGroup', () => ({
        credential_group_id: casual.make_id('credential_group'),
        name: casual.word,
    }));
    return casual;
};

const credential = (casual) => {
    casual.define('credential', () => ({
        credential_id: casual.make_id('credential'),
        name: casual.word,
        issue_type: casual.random_element(['token', 'credential']),
        credential_groups: arrayOf(casual.integer(1, 5), casual._credentialGroup),
    }));
    return casual;
};


export interface secretCasual {
    credentialGroup?: any;
    _credentialGroup?: any;
    credential?: any;
    _credential?: any;
}

const result: modelType[] = [
    credentialGroup, credential,
];

export default result;
