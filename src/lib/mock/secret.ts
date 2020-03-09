/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';

export default [
    new MockData('/secret/credential/list', () => makeArrayResults(arrayOf(10, casual._credentials), 80)),
    new MockData('/secret/credential-group/list', () => makeArrayResults(arrayOf(10, casual._credentialsGroup), 80)),
];
