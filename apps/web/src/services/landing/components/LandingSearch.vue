<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSearch } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

interface Props {
    workspaceList?: WorkspaceModel[];
}

const props = withDefaults(defineProps<Props>(), {
    workspaceList: () => ([]),
});

const state = reactive({
    searchText: '',
    menuList: computed(() => props.workspaceList),
});
</script>

<template>
    <div class="landing-search">
        <p-search v-model="state.searchText"
                  :placeholder="$t('LADING.SEARCH_WORKSPACE')"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-search {
    @apply flex flex-col;
}
</style>
