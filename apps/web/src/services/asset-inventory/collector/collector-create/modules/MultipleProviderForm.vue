<!-- This component is only visible in specific plugins. e.g.) Prowler -->

<template>
    <div class="multiple-provider-form">
        <p-field-title class="title">
            {{ $t('INVENTORY.COLLECTOR.CREATE.PROVIDER') }}
        </p-field-title>
        <div class="radio-container">
            <p-radio-group>
                <p-radio v-for="provider in state.providerList"
                         :key="provider.name"
                         :selected="state.selectedProvider"
                         :value="provider.name"
                         class="provider-item"
                         @change="handleChangeProvider"
                >
                    <div class="content-menu-item">
                        {{ provider.label }}
                    </div>
                </p-radio>
            </p-radio-group>
        </div>
        <!-- NOTE: screen mobile size-->
        <div class="dropdown-container">
            <p-select-dropdown :selected="state.selectedProvider"
                               :menu="state.providerList"
                               class="select-dropdown"
                               @update:selected="handleChangeProvider"
            >
                <template #menu-item--format="{ item }">
                    <div class="content-menu-item">
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </p-select-dropdown>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    computed, nextTick, reactive, watch,
} from 'vue';

import {
    PFieldTitle, PRadioGroup, PRadio, PSelectDropdown,
} from '@spaceone/design-system';


import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(event: 'update:is-provider-valid', value: boolean): void; }>();

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    providerList: computed(() => {
        const supportedProviderList = collectorFormState.repositoryPlugin?.capability?.supported_providers ?? [];
        return supportedProviderList.map((providerName) => ({
            label: state.providers[providerName]?.name,
            name: providerName,
        }));
    }),
    selectedProvider: computed(() => collectorFormState.provider),
    isProviderValid: computed(() => !!collectorFormState.provider),
});

const handleChangeProvider = (provider) => {
    collectorFormStore.setProvider(provider);
};


watch(() => state.providerList, (providerList) => {
    if (providerList.length) {
        nextTick(() => {
            collectorFormStore.setProvider(providerList[0]?.name);
        });
    }
}, { immediate: true });

watch(() => state.isProviderValid, (isValid) => {
    emit('update:is-provider-valid', isValid);
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.multiple-provider-form {
    .content-menu-item {
        @apply inline-flex items-center text-label-md;
        margin-left: 0.25rem;
    }

    .select-dropdown {
        width: 100%;
    }

    .provider-item {
        margin-bottom: 0.25rem;
    }

    .dropdown-container {
        width: 100%;
        display: none;
    }
}

@screen tablet {
    .multiple-provider-form {
        width: 100%;
        .radio-container {
            display: none;
        }
        .dropdown-container {
            @apply flex gap-4;
        }
    }
}
</style>

