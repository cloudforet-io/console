/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};

export default [
    new MockData('/statistics/inventory/server/diff', () => []),
];
