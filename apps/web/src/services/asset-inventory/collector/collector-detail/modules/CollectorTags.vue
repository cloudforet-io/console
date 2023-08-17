<script setup lang="ts">
import { computed } from 'vue';

import { PTag, PFieldTitle, PEmpty } from '@spaceone/design-system';

import { isNotEmpty } from '@cloudforet/core-lib';

import type { Tags } from '@/models';

const props = withDefaults(defineProps<{
    tags: Tags;
}>(), {
    tags: () => ({}),
});

const sortedTags = computed<[key: string, value: any][]>(() => {
    const tags = props.tags;
    return Object.entries(tags).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
});
</script>

<template>
    <div class="collector-tags">
        <p-field-title size="sm"
                       color="gray"
                       font-weight="regular"
                       inline
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.TAG') }}
        </p-field-title>
        <div class="tags-wrapper">
            <template v-if="isNotEmpty(props.tags)">
                <p-tag v-for="([key, value]) in sortedTags"
                       :key="`${key}-${value}`"
                       :key-item="{name: key}"
                       :value-item="{name: value}"
                       :deletable="false"
                       style-type="primary"
                       size="sm"
                />
            </template>
            <p-empty v-else>
                {{ $t('INVENTORY.COLLECTOR.DETAIL.NO_TAG') }}
            </p-empty>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.collector-tags {
    display: flex;
    gap: 0.5rem;
    > .p-field-title {
        height: 1.25rem;
        justify-content: center;
    }
    .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        > .p-tag {
            margin: 0;
        }
    }
}
</style>
