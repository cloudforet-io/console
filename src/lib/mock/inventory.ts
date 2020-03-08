/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};


export default [
    new MockData('/inventory/server/list', () => makeArrayResults(arrayOf(15, casual._server), 80)),
    new MockData(RegExp('.*?/.*?/member/list'), () => makeArrayResults(arrayOf(5, casual._member), 35)),
    new MockData('/inventory/collector/list', () => makeArrayResults(arrayOf(15, casual._collector), 80)),
];
