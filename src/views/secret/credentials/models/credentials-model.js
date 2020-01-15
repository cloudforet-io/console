import casual, { arrayOf } from '@/lib/casual';

casual.define('credentials', () => ({
    credentials_id: casual.word,
    issue_type: casual.last_name,
    group: casual.make_id('group'),
    created_at: casual.timestamp,
    domain_id: casual.make_id('domain'),
}));

export default casual;
