/* eslint-disable camelcase */
import { ModelType } from '@/lib/mock/casual/type';

const userInfo = (casual) => {
    casual.define('userInfo', () => ({
        mobile: casual.phone,
        timezone: casual.timezone,
        group: casual.word,
        tags: casual.tags,
        name: casual.name,
        created_at: casual.time('YYYY-MM-DDTHH:mm:ss'),
        domain_id: casual.make_id('domain'),
        last_accessed_at: casual.time('YYYY-MM-DDTHH:mm:ss'),
        email: casual.email,
        user_id: casual.make_id('user'),
        language: casual.random_element(['en', 'ko']),
        state: casual.random_element(['ENABLED', 'DISABLED']),
    }));
    return casual;
};


const member = (casual) => {
    casual.define('member', () => ({
        labels: casual.labels,
        user_info: casual.userInfo,
        resource_type: casual.random_element(['REGION', 'PROJECT', 'ZOON', 'POOL']),
        resource_id: casual.make_id('resource'),
        name: casual.word,
    }));
    return casual;
};

export interface MemberCasual {
    userInfo?: any;
    _userInfo?: any;
    member?: any;
    _member?: any;
}

const result: ModelType[] = [
    userInfo, member,
];

export default result;
