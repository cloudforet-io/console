import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';


interface Getters {
    autoSyncAdditionalOptionsSchema: ComputedRef<any>;
    selectedProviderItem: ComputedRef<ProviderItem>;
    scheduleHours: ComputedRef<number[]>;
}
export const useServiceAccountPageStore = defineStore('page-service-account', () => {
    const allReferenceStore = useAllReferenceStore();

    const state = reactive({
        selectedProvider: '',
        autoSyncAdditionalOptionsSchema: {},
    });

    const formState = reactive({
        additionalOptions: {},
        selectedSingleWorkspace: '',
        skipProjectGroup: true,
        scheduleHours: [] as number[],
    });

    const getters = reactive<Getters>({
        autoSyncAdditionalOptionsSchema: computed(() => state.autoSyncAdditionalOptionsSchema),
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
        scheduleHours: computed(() => formState.scheduleHours),
    });
    const actions = {
        setAutoSyncAdditionalOptionsSchema: () => {
            state.autoSyncAdditionalOptionsSchema = { // dummy data
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
        setProvider: (provider: string) => { state.selectedProvider = provider; },
        setFormState: (key:string, data: any) => {
            formState[key] = data;
        },
    };

    return {
        state,
        formState,
        getters,
        ...actions,
    };
});
