import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';
import { MockData } from '@/lib/mock/toolset';
import identity from '@/lib/mock/identity';

// Match ALL requests

class MockUp {
    constructor(protected mock: any, responses:Array<MockData>) {
        // @ts-ignore
        this.mock.onAny().reply((config) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const mockData of responses) {
                if (config.method?.toUpperCase() === mockData.method) {
                    if (config.url === mockData.path || config.url?.search(mockData.path) !== -1) {
                        console.debug('response', config.url, mockData.path, config.url?.search(mockData.path), mockData.response);
                        return mockData.response;
                    }
                }
            }
            return [200, {}];
        });
    }
}

const defaultMockData = [
    // eslint-disable-next-line camelcase
    new MockData(RegExp('.*?/list.*'), { results: [], total_count: 0 }),
];


export const setMockData = (instance:AxiosInstance) => {
    const mock = new MockAdapter(instance);
    new MockUp(mock, [
        ...identity,
        ...defaultMockData,
    ]);
};
