/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};

export const SupervisorMock = {
    supervisor_id: 'supervisor_id',
};

export default [
    new MockData('/plugin/supervisor/list', () => (makeArrayResults([SupervisorMock,SupervisorMock,SupervisorMock]))),

];
