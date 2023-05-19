<template>
    <div class="collector-page-1">
        <p-search v-model="state.searchValue"
                  @search="handleSearch"
        />
        <div class="contents-container">
            <step1-search-filter />
            <div class="right-area">
                right
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import { PSearch } from '@spaceone/design-system';

import Step1SearchFilter from '@/services/asset-inventory/collector/create-collector/modules/Step1SearchFilter.vue';

const state = reactive({
    searchValue: '',
});

const handleSearch = (value) => {
    console.log('value', value);
};

(() => {
})();
</script>

<style lang="postcss" scoped>
.collector-page-1 {
    min-width: 59.5625rem;
    width: 100%;
    .contents-container {
        @apply flex;
        margin-top: 1.5rem;
    }
}

@screen tablet {
    .collector-page-1 {
        min-width: 43rem;
        .contents-container {
            @apply flex-col;
        }
    }
}

@screen mobile {
    .collector-page-1 {
        min-width: unset;
        max-width: 100vw;
    }
}
</style>

