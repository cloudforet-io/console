<script lang="ts" setup>
import { PHeading } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';


interface Props {
    budgetId: string;
}

withDefaults(defineProps<Props>(), {
    budgetId: '',
});
const router = useRouter();
const { t } = useI18n();
// const state = reactive({
// });

const handleFormConfirm = () => {

};

</script>

<template>
    <div>
        <p-heading :title="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.UPDATE_BUDGET')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <budget-form :budget-id="budgetId"
                     @confirm="handleFormConfirm"
        />
    </div>
</template>
