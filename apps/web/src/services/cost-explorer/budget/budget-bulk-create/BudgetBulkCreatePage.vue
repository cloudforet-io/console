<script lang="ts" setup>
import { PButton, PHeading } from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useRouter } from 'vue-router';

import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import BudgetBulkCreateFileUpload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateFileUpload.vue';
import BudgetBulkCreateModal
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateModal.vue';
import BudgetBulkCreateTemplateDownload
    from '@/services/cost-explorer/budget/budget-bulk-create/modules/BudgetBulkCreateTemplateDownload.vue';

const router = useRouter();

const state = reactive({
    createModalVisible: false,
});

const handleClickPreviewAndCreate = () => {
    state.createModalVisible = true;
};

</script>

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
                  @click="router.go(-1)"
        >
            Cancel
        </p-button>
        <p-button style-type="primary"
                  @click="handleClickPreviewAndCreate"
        >
            Preview & Create
        </p-button>

        <budget-bulk-create-modal v-model:visible="state.createModalVisible" />
    </div>
</template>
