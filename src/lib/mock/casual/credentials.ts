import { arrayOf } from '@/lib/casual';

const credentials = (casual) => {
    casual.define('credentials', () => ({
        credentials_id: casual.word,
        issue_type: casual.last_name,
        group: casual.make_id('group'),
        created_at: casual.timestamp,
        domain_id: casual.make_id('domain'),
    }));
    return casual;
};

const credentialsGroup = (casual) => {
    casual.define('credentialsGroup', () => ({
        credentials: arrayOf(casual.integer(1, 20), casual._credentials),
        credential_group_id: casual.make_id('cred-grp'),
        name: casual.word,
        domain_id: casual.make_id('domain'),
        tags: casual.tags,
        created_at: casual.timestamp,
    }));
    return casual;
};

export default [
    credentials, credentialsGroup,
];
