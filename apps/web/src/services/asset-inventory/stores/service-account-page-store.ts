import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { defineStore } from 'pinia';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';


interface Getters {
    autoSyncAdditionalOptionsSchema: ComputedRef<JsonSchema|undefined>;
    selectedProviderItem: ComputedRef<ProviderItem>;
    scheduleHours: ComputedRef<number[]>;
    supportAutoSync: ComputedRef<boolean>;
}
export const useServiceAccountPageStore = defineStore('page-service-account', () => {
    const allReferenceStore = useAllReferenceStore();

    const state = reactive({
        selectedProvider: '',
    });

    const formState = reactive({
        // autoSync
        additionalOptions: {},
        isAdditionalOptionsValid: false,
        selectedSingleWorkspace: '',
        skipProjectGroup: true,
        scheduleHours: [] as number[],
        isScheduleHoursValid: false,
    });

    const getters = reactive<Getters>({
        selectedProviderItem: computed(() => allReferenceStore.getters.provider[state.selectedProvider]),
        autoSyncAdditionalOptionsSchema: computed(() => getters.selectedProviderItem?.data?.plugin_info?.metadata?.additional_options_schema),
        scheduleHours: computed(() => formState.scheduleHours),
        supportAutoSync: computed(() => !!getters.selectedProviderItem?.data?.options?.support_auto_sync),
    });
    const actions = {
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
