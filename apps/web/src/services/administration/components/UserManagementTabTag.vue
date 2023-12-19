<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDataTable, PHeading } from '@spaceone/design-system';

import type { TimeStamp } from '@/schema/_common/model';
import { i18n } from '@/translations';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();

const state = reactive({
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'key', label: i18n.t('COMMON.TAGS.KEY') as string },
        { name: 'value', label: i18n.t('COMMON.TAGS.VALUE') as string },
    ]),
});

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    state.items = Object.entries(state.selectedUser.tags || {}).map(([k, v]) => ({
        key: k,
        value: v,
    }));
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-tag">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.TAG')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      col-copy
                      sort-by="name"
                      sortable
                      sort-desc
                      beautify-text
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-tag {
    @apply flex flex-col;
}
</style>
