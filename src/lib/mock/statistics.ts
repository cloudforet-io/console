/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};

export default [
    // new MockData('/statistics/inventory/server/diff', () => makeArrayResults(arrayOf(20, casual._resourceDiff), 20)),
    // new MockData('/statistics/inventory/cloud-service/diff', () => []),
];
