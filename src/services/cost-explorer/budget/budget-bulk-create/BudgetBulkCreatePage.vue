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
    reactive, toRefs,
} from '@vue/composition-api';

import { PBreadcrumbs, PButton, PPageTitle } from '@spaceone/design-system';

import BudgetBulkCreateTemplateDownload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateTemplateDownload.vue';
import BudgetBulkCreateFileUpload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateFileUpload.vue';
import BudgetBulkCreateModal
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateModal.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

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
            route: [
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME } },
                { name: 'Create Bulk Budget' },
            ],
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
