import { asyncComputed } from '@vueuse/core';
import type { Ref, UnwrapRef } from 'vue';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { PackageCreateParameters } from '@/schema/identity/package/api-verbs/create';
import type { PackageUpdateParameters } from '@/schema/identity/package/api-verbs/update';
import type { PackageModel } from '@/schema/identity/package/model';


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

    const actions = {
        async list() {
            return new Promise<PackageModel[]>((resolve) => {
                state.loading = true;
                setTimeout(() => {
                    const packages: PackageModel[] = [
                        {
                            package_id: 'package_1',
                            name: 'Advanced',
                            description: '고급 패키지',
                            order: 1,
                            is_default: false,
                            tags: {},
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                        },
                        {
                            package_id: 'package_2',
                            name: 'Standard',
                            description: '표준 패키지',
                            order: 2,
                            is_default: false,
                            tags: {},
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                        },
                        {
                            package_id: 'package_3',
                            name: 'Basic',
                            description: '기본 패키지',
                            order: 3,
                            is_default: true,
                            tags: {},
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                        },
                    ];
                    state.items = packages;
                    state.loading = false;
                    resolve(packages);
                }, 1000);
            });
        },
        async create(param: PackageCreateParameters) {
            return new Promise<PackageModel>((resolve) => {
                setTimeout(() => {
                    const result: PackageModel = {
                        package_id: `package_${getters.packages.length + 1}`,
                        name: param.name,
                        description: param.description ?? '',
                        order: 4,
                        is_default: false,
                        tags: param.tags ?? {},
                        domain_id: '1',
                        created_at: '2021-09-01T00:00:00',
                        updated_at: '2021-09-01T00:00:00',
                    };
                    if (state.items) state.items.push(result);
                    else state.items = [result];
                    resolve(result);
                }, 1000);
            });
        },
        async update(param: PackageUpdateParameters) {
            return new Promise<PackageModel>((resolve, reject) => {
                setTimeout(() => {
                    const targetPackage = getters.packages.find((p) => p.package_id === param.package_id);
                    if (targetPackage) {
                        targetPackage.name = param.name ?? targetPackage.name;
                        targetPackage.description = param.description ?? targetPackage.description;
                        targetPackage.tags = param.tags ?? targetPackage.tags;
                        targetPackage.updated_at = Date.now().toString();
                        resolve(targetPackage);
                    } else {
                        reject(new Error('Package not found'));
                    }
                }, 1000);
            });
        },
        async setDefaultPackage(packageId: string) {
            return new Promise<PackageModel>((resolve, reject) => {
                setTimeout(() => {
                    const prevDefaultPackage = getters.packages.find((p) => p.is_default);
                    if (prevDefaultPackage?.package_id === packageId) return;
                    if (prevDefaultPackage) prevDefaultPackage.is_default = false;
                    const targetPackage = getters.packages.find((p) => p.package_id === packageId);
                    if (targetPackage) {
                        targetPackage.is_default = true;
                        resolve(targetPackage);
                    } else {
                        reject(new Error('Package not found'));
                    }
                }, 1000);
            });
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
