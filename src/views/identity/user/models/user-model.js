import casual, { arrayOf } from '@/lib/casual';

casual.define('user', () => ({
    user_id: casual.word,
    name: casual.last_name,
    state: casual.random_element(['ENABLED', 'DISABLED']),
    email: casual.email,
    mobile: casual.phone,
    group: casual.make_id('group'),
    language: casual.language_code,
    timezone: casual.timezone,
    tags: arrayOf(3, casual._tag),
    last_accessed_at: casual.timestamp,
    created_at: casual.timestamp,
    domain_id: casual.make_id('domain'),
}));

export default casual;
