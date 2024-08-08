<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading, PButton, PToolboxTable } from '@cloudforet/mirinae';

const tableState = reactive({
    fields: computed(() => [
        // TODO: temp data
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'role', label: 'Role' },
        { name: 'remove_button', label: ' ' },
    ]),
    items: computed(() => [{
        // TODO: temp data
        user_id: 'Kara_Herzog@yahoo.com',
        name: '',
        state: 'Enabled',
        role: 'Workspace Member Role',
    }]),
});
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading class="workspace-group-tab-group-user-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                   use-total-count
                   :total-count="28"
                   heading-type="sub"
        >
            <template #extra>
                <div class="workspace-group-tab-group-user-button-wrapper">
                    <p-button style-type="secondary"
                              disabled
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                    </p-button>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_USER') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         selectable
        >
            <template #col-remove_button-format="{}">
                <p-button size="sm"
                          style-type="tertiary"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-button-wrapper {
        display: flex;
        gap: 1rem;
    }

    .workspace-group-tab-group-user-table {
        border: none;
    }
}
</style>
