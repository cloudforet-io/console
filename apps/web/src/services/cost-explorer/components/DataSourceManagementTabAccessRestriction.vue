<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PHeading, PToggleButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

const state = reactive({
    dataType: computed(() => [
        i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COST'),
        i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.USAGE'),
        i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.PAY_AS_YOU_GO'),
    ]),
    dataTypeEnable: {
        cost: true,
        usage: false,
        payAsYouGo: false,
    },
});
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
                <p-toggle-button :value="state.dataTypeEnable[item]"
                                 class="toggle-button"
                />
                <span>
                    {{ item }}
                    <span v-if="item.toLowerCase() === 'cost'"
                          class="extra"
                    >
                        ({{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ACTUAL_COST') }})
                    </span>
                </span>
            </div>
        </div>
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
