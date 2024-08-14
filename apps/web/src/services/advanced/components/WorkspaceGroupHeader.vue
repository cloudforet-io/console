<script setup lang="ts">
import { PHeading, PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();

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
        <p-heading class="workspace-group-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TITLE')"
                   use-total-count
                   :total-count="12"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.CREATE') }}
                </p-button>
            </template>
        </p-heading>
    </section>
</template>
