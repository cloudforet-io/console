<template>
    <div>
        <div class="flex flex-wrap justify-between">
            <div>
                <p-heading title="Create Bulk Budget" />
            </div>
            <handbook-button type="billing/cost-analysis/budget/bulk-create" />
        </div>

        <budget-bulk-create-template-download />
        <budget-bulk-create-file-upload />

        <p-button style-type="secondary"
                  class="mr-4"
                  @click="$router.go(-1)"
        >
            Cancel
        </p-button>
        <p-button style-type="primary"
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
} from 'vue';

import { PButton, PHeading } from '@spaceone/design-system';

import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import BudgetBulkCreateFileUpload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateFileUpload.vue';
import BudgetBulkCreateModal
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateModal.vue';
import BudgetBulkCreateTemplateDownload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateTemplateDownload.vue';

export default {
    name: 'BudgetBulkCreatePage',
    components: {
        HandbookButton,
        BudgetBulkCreateFileUpload,
        BudgetBulkCreateTemplateDownload,
        BudgetBulkCreateModal,
        PButton,
        PHeading,
    },
    setup() {
        const state = reactive({
            createModalVisible: false,
        });

        const handleClickPreviewAndCreate = () => {
            state.createModalVisible = true;
        };

        return {
            ...toRefs(state),
            handleClickPreviewAndCreate,
        };
    },
};
</script>
