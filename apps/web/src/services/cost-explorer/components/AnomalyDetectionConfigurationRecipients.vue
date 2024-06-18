<script setup lang="ts">

import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PButton, PDefinitionTable, PBadge,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import AnomalyDetectionConfigurationRecipientsForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationRecipientsForm.vue';
import { getRoleInfo } from '@/services/cost-explorer/composables/anomaly-detection-handler';
import { CONFIG_TEMP_DATA } from '@/services/cost-explorer/constants/anomaly-detection-constant';

const route = useRoute();

const state = reactive({
    isDetailPage: false,
    isEdit: false,
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'recipients', label: 'Send to', disableCopy: true },
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
    <div class="anomaly-detection-configuration-recipients">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.RECIPIENTS')"
                   heading-type="sub"
                   class="heading"
        >
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
        </p-heading>
        <anomaly-detection-configuration-recipients-form v-if="state.isEdit"
                                                         :is-detail-page="state.isDetailPage"
        />
        <p-definition-table v-else
                            :fields="tableState.fields"
                            style-type="white"
                            :data="CONFIG_TEMP_DATA[0]"
                            :skeleton-rows="1"
                            class="config-definition-table"
                            v-on="$listeners"
        >
            <template #data-recipients="{data}">
                <div class="role-item">
                    <img v-if="data[0].type !== ROLE_TYPE.USER"
                         :src="getRoleInfo(data[0].type)"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>role name</span>
                    <p-badge style-type="blue200"
                             badge-type="subtle"
                    >
                        + 3
                    </p-badge>
                </div>
            </template>
        </p-definition-table>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-recipients {
    @apply flex flex-col bg-white border border-gray-200;
    padding-bottom: 1.5rem;
    border-radius: 0.375rem;
    .role-item {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
    }
    .config-definition-table {
        padding-bottom: 1rem;
    }
}

/* custom design-system component - p-definition-table */
:deep(.p-definition-table) {
    min-height: unset;
}
</style>
