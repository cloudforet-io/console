<script setup lang="ts">

import { PI, PLazyImg } from '@cloudforet/mirinae';

import type { MappingItem } from '@/common/components/mapping-method/type';

interface Props {
    items: MappingItem[];
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
});


</script>

<template>
    <div class="mapping-method">
        <div v-for="(item, idx) of props.items"
             :key="item.name"
        >
            <div class="mapping-block">
                <div class="left">
                    <p-i v-if="item.icon"
                         :name="item.icon"
                         width="1.25rem"
                         height="1.25rem"
                    />
                    <p-lazy-img v-else
                                :src="item.imageUrl"
                                width="1.25rem"
                                height="1.25rem"
                    >
                        `
                    </p-lazy-img>
                </div>
                <div class="right">
                    <slot :name="item.name" />
                </div>
            </div>
            <div v-if="props.items.length !== (idx + 1)"
                 class="bridge"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.mapping-method {
    @apply flex flex-col text-label-md;

    .mapping-block {
        @apply flex border border-gray-200 rounded-lg;
        overflow: hidden;

        .left {
            @apply flex items-center justify-center bg-gray-100 p-2;
            width: 3.5rem;
        }

        .right {
            @apply flex items-center;
            padding: 0.75rem 1rem;
        }
    }
    .bridge {
        @apply bg-gray-200;
        width: 0.25rem;
        height: 0.75rem;
        margin-left: 1.625rem;
    }
}

</style>
