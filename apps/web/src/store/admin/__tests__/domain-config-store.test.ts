import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import { useDomainConfigStore } from '@/store/admin/domain-config-store';
import type { DomainConfigType } from '@/store/domain/type';

vi.mock('@cloudforet/core-lib/space-connector', () => ({
    SpaceConnector: {
        client: {
            config: {
                domainConfig: {
                    get: vi.fn(),
                    set: vi.fn(),
                },
            },
        },
    },
}));
const testKey = 'testKey' as DomainConfigType;
const testData: DomainConfigModel = {
    name: testKey,
    data: { value: 'testValue' },
    tags: {},
    domain_id: 'testDomainId',
    created_at: '2021-01-01T00:00:00Z',
    updated_at: '2021-01-01T00:00:00Z',
};

describe('useDomainConfigStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('checks the initial state', () => {
        const store = useDomainConfigStore();
        expect(store.state.domainConfigMap).toEqual({});
    });

    it('returns existing data when get() is called', async () => {
        const store = useDomainConfigStore();
        store.state.domainConfigMap[testKey] = testData;

        const result = await store.get(testKey);
        expect(result).toEqual(testData);
    });

    it('fetches data from the server when get() is called', async () => {
        const store = useDomainConfigStore();
        SpaceConnector.client.config.domainConfig.get.mockImplementation(async () => testData);

        const result = await store.get(testKey);
        expect(SpaceConnector.client.config.domainConfig.get).toHaveBeenCalledWith({ name: testKey });
        expect(result).toEqual(testData);
        expect(store.state.domainConfigMap[testKey]).toEqual(testData);
    });

    it('saves data to the server and updates the state when set() is called', async () => {
        const store = useDomainConfigStore();
        SpaceConnector.client.config.domainConfig.set.mockImplementation(async (data) => ({
            ...testData,
            ...data,
        }));

        const result = await store.set(testKey, { value: 'updatedValue' });
        expect(SpaceConnector.client.config.domainConfig.set).toHaveBeenCalledWith({
            name: testKey,
            data: { value: 'updatedValue' },
        });
        const newData = { ...testData, data: { value: 'updatedValue' } };
        expect(result).toEqual(newData);
        expect(store.state.domainConfigMap[testKey]).toEqual(newData);
    });

    it('resets the state when reset() is called', () => {
        const store = useDomainConfigStore();
        store.state.domainConfigMap[testKey] = testData;

        store.reset();
        expect(store.state.domainConfigMap).toEqual({});
    });
});
