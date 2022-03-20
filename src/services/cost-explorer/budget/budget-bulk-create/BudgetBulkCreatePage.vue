<template>
    <div>
        <div class="flex flex-wrap justify-between">
            <div>
                <p-breadcrumbs :routes="routeState.route" />
                <p-page-title title="Create Bulk Budget" />
            </div>
            <handbook-button type="billing/cost-analysis/budget/bulk-create" />
        </div>

        <budget-bulk-create-template-download />
        <budget-bulk-create-file-upload />

        <p-button style-type="primary-dark" :outline="true" class="mr-4"
                  @click="$router.go(-1)"
        >
            Cancel
        </p-button>
        <p-button style-type="primary-dark"
                  @click="handleClickPreviewAndCreate"
        >
            Preview & Create
        </p-button>

        <budget-bulk-create-modal v-model="createModalVisible" />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PBreadcrumbs, PButton, PPageTitle } from '@spaceone/design-system';

import { i18n } from '@/translations';

import BudgetBulkCreateTemplateDownload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateTemplateDownload.vue';
import BudgetBulkCreateFileUpload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateFileUpload.vue';
import BudgetBulkCreateModal
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateModal.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

export default {
    name: 'BudgetBulkCreatePage',
    components: {
        HandbookButton,
        PBreadcrumbs,
        PPageTitle,
        BudgetBulkCreateFileUpload,
        BudgetBulkCreateTemplateDownload,
        PButton,
        BudgetBulkCreateModal,
    },
    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: i18n.t('MENU.BILLING.BUDGET'), path: '/billing/cost-management/budget' },
                { name: 'Create Bulk Budget' },
            ]),
        });

        const state = reactive({
            createModalVisible: false,
        });

        const handleClickPreviewAndCreate = () => {
            state.createModalVisible = true;
        };

        return {
            routeState,
            ...toRefs(state),
            handleClickPreviewAndCreate,
        };
    },
};
</script>
