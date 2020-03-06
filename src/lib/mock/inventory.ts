/* eslint-disable camelcase */
import { MockData } from '@/lib/mock/toolset';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};


export default [
    new MockData('/inventory/server/list', () => ({
        results: [DOMAIN_INFO],
        total_count: 1,
    })),
];
