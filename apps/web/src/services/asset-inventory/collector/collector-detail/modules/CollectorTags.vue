<script setup lang="ts">
import { PTag, PFieldTitle } from '@spaceone/design-system';

import type { Tags } from '@/models';

const props = withDefaults(defineProps<{
    tags: Tags;
}>(), {
    tags: () => ({}),
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
            <p-tag v-for="(value, key) in props.tags"
                   :key="`${key}-${value}`"
                   :key-item="{name: key}"
                   :value-item="{name: value}"
                   :deletable="false"
                   style-type="primary"
                   size="sm"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.collector-tags {
    display: flex;
    gap: 0.5rem;
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
