<script setup lang="ts">
import { computed } from 'vue';

import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useWorkspaceGroupListQuery } from '@/services/advanced/composables/querys/use-workspace-group-list-query';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

interface Props {
    hasReadWriteAccess?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    hasReadWriteAccess: true,
});

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const { data: workspaceGroupListData } = useWorkspaceGroupListQuery();

const totalCount = computed(() => workspaceGroupListData.value?.total_count ?? 0);

const handleCreateButtonClick = () => {
    workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.CREATE,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.CREATE_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.CREATE,
    });
};
</script>

<template>
    <section class="workspace-group-header">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading class="workspace-group-header"
                           :title="$t('IAM.WORKSPACE_GROUP.TITLE')"
                           use-total-count
                           :total-count="totalCount"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
    </section>
</template>
