import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';


interface Getters {
    autoSyncAdditionalOptions: ComputedRef<any>;
    selectedProviderItem: ComputedRef<ProviderItem>;
}
export const useServiceAccountPageStore = defineStore('page-service-account', () => {
    const allReferenceStore = useAllReferenceStore();

    const state = reactive({
        selectedProvider: '',
        autoSyncAdditionalOptions: {},
        scheduleHours: [] as number[],
    });

    const getters = reactive<Getters>({
        autoSyncAdditionalOptions: computed(() => state.autoSyncAdditionalOptions),
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
    });
    const actions = {
        setAutoSyncAdditionalOptions: () => {
            state.autoSyncAdditionalOptions = { // dummy data
                type: 'object',
                required: [
                    'compliance_framework',
                ],
                properties: {
                    provider: {
                        type: 'string',
                        default: 'aws',
                        title: 'Provider',
                    },
                    compliance_framework: {
                        enum: [
                            'CIS-1.4',
                            'CIS-1.5',
                            'CIS-2.0',
                        ],
                        type: 'string',
                        default: 'CIS-1.5',
                        title: 'Compliance Framework',
                    },
                },
                order: [
                    'compliance_framework',
                    'provider',
                ],
            };
        },
        setProvider: (provider: string) => {
            state.selectedProvider = provider;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
