/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';

export default [
    new MockData('/repository/repository/list', () => makeArrayResults(arrayOf(10, casual._repository), 80)),
    new MockData('/repository/plugin/list', () => makeArrayResults(arrayOf(10, casual._plugin), 80)),
    new MockData('/repository/plugin/get-versions', () => casual._pluginVersion),
];
