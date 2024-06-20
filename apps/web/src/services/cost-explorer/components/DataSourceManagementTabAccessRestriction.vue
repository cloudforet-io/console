<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PHeading, PToggleButton, PButtonModal } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

const state = reactive({
    dataType: computed(() => [
        { label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COST'), name: 'cost' },
        { label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.USAGE'), name: 'usage' },
        { label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.PAY_AS_YOU_GO'), name: 'payAsYouGo' },
    ]),
    dataTypeEnable: {
        cost: true,
        usage: false,
        payAsYouGo: false,
    },
    selectedDataType: '',
    modalVisible: false,
});

const handleChangeToggle = (item: string, value: boolean) => {
    state.selectedDataType = item as string;
    state.dataTypeEnable[item] = value;
    if (value) {
        state.modalVisible = true;
    } else {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_DISABLED_TOGGLE'), '');
    }
};
</script>

<template>
    <div class="data-source-management-tab-access-restriction">
        <p-heading heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_RESTRICTION')"
                   class="title"
        />
        <div class="contents-wrapper">
            <strong class="desc">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESTRICTION_DESC') }}</strong>
            <div v-for="(item, idx) in state.dataType"
                 :key="idx"
                 class="data-type-card"
            >
                <p-toggle-button :value="state.dataTypeEnable[item.name]"
                                 class="toggle-button"
                                 @change-toggle="handleChangeToggle(item.name, $event)"
                />
                <span>
                    {{ item.label }}
                    <span v-if="item.name === 'cost'"
                          class="extra"
                    >
                        ({{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ACTUAL_COST') }})
                    </span>
                </span>
            </div>
        </div>
        <p-button-modal
            :header-title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.MODAL_TITLE')"
            centered
            size="sm"
            fade
            backdrop
            :visible.sync="state.modalVisible"
        >
            <template #body>
                <p class="modal-body">
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.MODAL_CONTENT') }}
                </p>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.data-source-management-tab-access-restriction {
    .contents-wrapper {
        @apply flex flex-col text-label-md;
        margin-top: 0.5rem;
        margin-right: 1rem;
        margin-left: 1rem;
        gap: 0.5rem;
        .data-type-card {
            @apply flex items-center border border-gray-200;
            max-width: 35rem;
            padding: 0.75rem;
            border-radius: 0.375rem;
            gap: 0.75rem;
            .extra {
                @apply text-gray-500;
            }
        }
    }
}
</style>
