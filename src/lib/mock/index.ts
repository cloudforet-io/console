import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import identity from '@/lib/mock/identity';
import inventory from '@/lib/mock/inventory';
import secret from '@/lib/mock/secret';
import repository from '@/lib/mock/repository';

// Match ALL requests

class MockUp {
    constructor(protected mock: any, responses:Array<MockData>) {
        // @ts-ignore
        this.mock.onAny().reply((config) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const mockData of responses) {
                if (mockData.isMatch(config)) {
                    return mockData.makeResponse(config);
                }
            }
            return [200, {}];
        });
    }
}

const defaultMockData = [
    // eslint-disable-next-line camelcase
    new MockData(RegExp('.*?/list.*'), () => makeArrayResults()),
];


export const setMockData = (instance:AxiosInstance) => {
    const mock = new MockAdapter(instance);
    new MockUp(mock, [
        ...identity,
        ...inventory,
        ...secret,
        ...repository,
        ...defaultMockData,
    ]);
};
