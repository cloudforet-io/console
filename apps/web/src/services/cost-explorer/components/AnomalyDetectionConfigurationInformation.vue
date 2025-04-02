<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PButton, PDefinitionTable, PLink, PLazyImg, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import AnomalyDetectionConfigurationInformationForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformationForm.vue';
import { CONFIG_TEMP_DATA } from '@/services/cost-explorer/constants/anomaly-detection-constant';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const route = useRoute();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
});
const state = reactive({
    isDetailPage: false,
    isEdit: false,
});
const tableState = reactive({
    loading: false,
    fields: computed<DefinitionField[]>(() => [
        { name: 'name', label: 'Name', disableCopy: true },
        { name: 'policy', label: 'Policy', disableCopy: true },
        { name: 'data_source', label: 'Data Source', disableCopy: true },
        { name: 'category', label: 'Category & Item', disableCopy: true },
    ]),
});

watch(() => route.params.configId, (configId) => {
    if (configId) {
        state.isDetailPage = true;
        state.isEdit = false;
    } else {
        state.isEdit = true;
    }
}, { immediate: true });
</script>

<template>
    <div class="anomaly-detection-configuration-information">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.BASE_INFORMATION')"
                           heading-type="sub"
                />
            </template>
            <template v-if="state.isDetailPage && !state.isEdit"
                      #extra
            >
                <p-button icon-left="ic_edit"
                          style-type="secondary"
                          @click="state.isEdit = true"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.EDIT') }}
                </p-button>
            </template>
        </p-heading-layout>
        <anomaly-detection-configuration-information-form v-if="state.isEdit"
                                                          :is-edit.sync="state.isEdit"
                                                          :is-detail-page="state.isDetailPage"
        />
        <p-definition-table v-else
                            :fields="tableState.fields"
                            style-type="white"
                            :data="CONFIG_TEMP_DATA[0]"
                            :loading="tableState.loading"
                            :skeleton-rows="4"
                            class="config-definition-table"
                            v-on="$listeners"
        >
            <template #data-policy="{data}">
                <p-link action-icon="internal-link"
                        new-tab
                        :to="{}"
                >
                    {{ data }}
                </p-link>
            </template>
            <template #data-data_source="{value}">
                <div class="col-data-source">
                    <p-lazy-img width="1rem"
                                height="1rem"
                                :src="assetUrlConverter(storeState.providers[value]?.icon)"
                                alt="provider-icon"
                                class="icon"
                    />
                    <span>{{ storeState.providers[value]?.label }}</span>
                </div>
            </template>
        </p-definition-table>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-information {
    @apply flex flex-col bg-white border border-gray-200;
    border-radius: 0.375rem;
    .config-definition-table {
        margin-top: 0.5rem;
        .col-data-source {
            @apply flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>
