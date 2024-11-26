import { asyncComputed } from '@vueuse/core';
import type { Ref, UnwrapRef } from 'vue';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PackageCreateParameters } from '@/schema/identity/package/api-verbs/create';
import type { PackageDeleteParameters } from '@/schema/identity/package/api-verbs/delete';
import type { PackageListParameters } from '@/schema/identity/package/api-verbs/list';
import type { PackageSetDefaultParameters } from '@/schema/identity/package/api-verbs/set-default';
import type { PackageUpdateParameters } from '@/schema/identity/package/api-verbs/update';
import type { PackageModel } from '@/schema/identity/package/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UsePackageStoreState {
    loading: boolean;
    items?: PackageModel[];
}
interface UsePackageStoreGetters {
    packages: Ref<Readonly<PackageModel[]>>
}
export const usePackageStore = defineStore('package', () => {
    const state = reactive<UsePackageStoreState>({
        loading: false,
        items: undefined,
    });

    const getters = reactive<UsePackageStoreGetters>({
        packages: asyncComputed<PackageModel[]>(async () => {
            if (state.items === undefined) {
                await actions.list();
            }
            return state.items ?? [];
        }, [], { lazy: true }),
    }) as UnwrapRef<UsePackageStoreGetters>;

    const fetchList = getCancellableFetcher<PackageListParameters, ListResponse<PackageModel>>(SpaceConnector.clientV2.identity.package.list);
    const actions = {
        async list() {
            state.loading = true;
            try {
                const result = await fetchList({});
                if (result.status === 'succeed') {
                    state.items = result.response.results;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },
        async create(param: PackageCreateParameters) {
            const response = await SpaceConnector.clientV2.identity.package.create<PackageCreateParameters, PackageModel>(param);
            return response;
        },
        async update(param: PackageUpdateParameters) {
            const response = await SpaceConnector.clientV2.identity.package.update<PackageUpdateParameters, PackageModel>(param);
            return response;
        },
        async setDefaultPackage(packageId: string) {
            const prevDefaultPackage = getters.packages.find((p) => p.is_default);
            if (prevDefaultPackage?.package_id === packageId) return prevDefaultPackage;
            const response = await SpaceConnector.clientV2.identity.package.setDefaultPackage<PackageSetDefaultParameters, PackageModel>({
                package_id: packageId,
            });
            return response;
        },
        async delete(packageId: string) {
            await SpaceConnector.clientV2.identity.package.delete<PackageDeleteParameters, undefined>({
                package_id: packageId,
            });
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
