<script setup lang="ts">
import type { Location } from 'vue-router';

import {
    PLazyImg,
} from '@cloudforet/mirinae';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


const props = defineProps<{
    label?: string;
    icon?: string;
    subText?: string;
    visibleAddButton?: boolean;
    addButtonLink?: Location;
}>();
</script>

<template>
    <div class=" flex items-center gap-1 h-8 mt-1 pb-2 px-2 text-gray-800 font-bold text-label-md">
        <div class="flex items-center h-6">
            <p-lazy-img
                v-if="props.icon"
                :src="assetUrlConverter(props.icon)"
                width="1.5rem"
                height="1.5rem"
                class="icon rounded flex-shrink-0"
            />
            <span>
                <slot>{{ props.label }}</slot>
                <span v-if="props.subText"
                      class="font-normal"
                >{{ props.subText }}</span>
            </span>
        </div>
    </div>
</template>
