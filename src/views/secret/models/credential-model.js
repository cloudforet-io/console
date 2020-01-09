import casual, { arrayOf } from '@/lib/casual';

casual.define('credential', () => ({
    credential_id: casual.make_id('cred'),
    name: casual.word,
    issue_type: casual.random_element(['credential', 'token']),
    project_id: casual.make_id('project'),
    domain_id: casual.make_id('domain'),
    tags: casual.tags,
    created_at: casual.timestamp,
}));

casual.define('credentials_group', () => ({
    credentials: arrayOf(casual.integer(1, 20), casual._credential),
    cdg_id: casual.make_id('cred-grp'),
    name: casual.word,
    domain_id: casual.make_id('domain'),
    tags: casual.tags,
    created_at: casual.timestamp,
}));
export default casual;
