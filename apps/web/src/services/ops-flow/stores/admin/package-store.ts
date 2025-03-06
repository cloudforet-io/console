import { asyncComputed } from '@vueuse/core';
import { watch, reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PackageCreateParameters } from '@/api-clients/identity/package/schema/api-verbs/create';
import type { PackageDeleteParameters } from '@/api-clients/identity/package/schema/api-verbs/delete';
import type { PackageListParameters } from '@/api-clients/identity/package/schema/api-verbs/list';
import type { PackageSetDefaultParameters } from '@/api-clients/identity/package/schema/api-verbs/set-default';
import type { PackageUpdateParameters } from '@/api-clients/identity/package/schema/api-verbs/update';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UsePackageStoreState {
    loading: boolean;
    items?: PackageModel[];
}
export const usePackageStore = defineStore('package', () => {
    const state = reactive<UsePackageStoreState>({
        loading: false,
        items: undefined,
    });

    const getters = {
        loading: computed(() => state.loading),
        packages: asyncComputed<PackageModel[]>(async () => {
            if (state.items === undefined) {
                await actions.list();
            }
            return state.items ?? [];
        }, [], { lazy: true }),
        defaultPackage: computed<PackageModel|undefined>(() => getters.packages.find((p) => p.is_default)),
    };

    const fetchList = getCancellableFetcher<PackageListParameters, ListResponse<PackageModel>>(SpaceConnector.clientV2.identity.package.list);
    const actions = {
        async list() {
            state.loading = true;
            try {
                const result = await fetchList({});
                if (result.status === 'succeed') {
                    state.items = result.response.results ?? [];
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },
        async create(param: PackageCreateParameters) {
            const response = await SpaceConnector.clientV2.identity.package.create<PackageCreateParameters, PackageModel>(param);
            state.items?.push(response);
            return response;
        },
        async update(param: PackageUpdateParameters) {
            const response = await SpaceConnector.clientV2.identity.package.update<PackageUpdateParameters, PackageModel>(param);
            state.items = state.items?.map((item) => (item.package_id === response.package_id ? response : item));
            return response;
        },
        async setDefaultPackage(packageId: string) {
            const prevDefaultPackage = getters.packages.find((p) => p.is_default);
            if (prevDefaultPackage?.package_id === packageId) return prevDefaultPackage;
            const response = await SpaceConnector.clientV2.identity.package.setDefault<PackageSetDefaultParameters, PackageModel>({
                package_id: packageId,
            });
            const prev = state.items?.find((p) => p.is_default);
            if (prev) prev.is_default = false;
            const current = state.items?.find((p) => p.package_id === packageId);
            if (current) current.is_default = true;
            if (state.items) state.items = [...state.items];
            return response;
        },
        async delete(packageId: string) {
            await SpaceConnector.clientV2.identity.package.delete<PackageDeleteParameters, undefined>({
                package_id: packageId,
            });
            state.items = state.items?.filter((item) => item.package_id !== packageId);
        },
    };
    const disposeSelf = () => {
        const store = usePackageStore();
        store.$reset();
        store.$dispose();
    };
    const appContextStore = useAppContextStore();
    watch(() => appContextStore.getters.globalGrantLoading, (globalGrantLoading) => {
        if (globalGrantLoading) disposeSelf();
    });
    return {
        getters,
        ...actions,
    };
});
