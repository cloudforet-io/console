/* eslint-disable camelcase */
import { MockData } from '@/lib/mock/toolset';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};

export const USER_INFO = {
    user_id: 'user_test_id',
    user_name: 'testUser',
    language: 'en',
    timezone: 'UTC',
};

export default [
    new MockData('/identity/domain/list', {
        results: [DOMAIN_INFO],
        total_count: 1,
    }),
    new MockData('/identity/user/get', USER_INFO),
    new MockData('/identity/domain-owner/get', USER_INFO),
    new MockData('/identity/token/issue', {
        access_token: 'asdf.asdf.asdf',
        refresh_token: 'asdf.asdf.asdf',
    }),
];
