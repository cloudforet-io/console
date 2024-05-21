<script setup lang="ts">
import { reactive } from 'vue';

import { PSearch } from '@spaceone/design-system';

const emit = defineEmits<{(e: 'search', value: string): void;
}>();

const state = reactive({
    searchText: '',
});
</script>

<template>
    <div class="landing-search">
        <p-search :value="state.searchText"
                  :placeholder="$t('LADING.SEARCH_WORKSPACE')"
                  class="workspace-search-bar"
                  @update:value="emit('search', $event)"
        />
    </div>
</template>
