<template>
    <div class="budget-toolbox">
        <div class="top">
            <div class="period-box">
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PERIOD') }}</span>
                <p-select-status v-for="(status, idx) in periodList" :key="idx"
                                 v-model="selectedPeriod"
                                 :value="status.name"
                                 multi-selectable
                                 @change="handleSelectStatus"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
        </div>
        <p-toolbox
            class="bottom"
            searchable
            exportable
            :setting-visible="false"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import { PToolbox, PSelectStatus } from '@spaceone/design-system';
import { i18n } from '@/translations';

export default {
    name: 'BudgetToolbox',
    components: {
        PToolbox,
        PSelectStatus,
    },
    setup() {
        const state = reactive({
            selectedPeriod: [],
            periodList: computed(() => [
                { name: 'total', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.TOTAL') },
                { name: 'thisMonth', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
            ]),
        });

        const handleSelectStatus = () => {
            console.log('select');
        };

        return {
            ...toRefs(state),
            handleSelectStatus,
        };
    },
};
</script>
<style scoped lang="postcss">
.budget-toolbox {
    @apply flex flex-wrap flex-col gap-4;
    .top {
        .period-box {
            @apply flex flex-wrap gap-4;
            .label {
                @apply text-gray-500;
            }
        }
    }
}
</style>
