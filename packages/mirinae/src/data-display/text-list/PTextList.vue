<template>
    <span class="p-text-list">
        <component :is="state.component"
                   v-for="(item, i) in state.displayItems"
                   :key="i"
                   class="list-item"
                   :class="{'line-break': state.isLineBreak && i < state.displayItems.length - 1}"
                   :href="getHref"
                   :target="target || undefined"
        >
            <slot name="default"
                  v-bind="{...$props, index: i, item, value: item || ''}"
            >
                {{ item || '' }}
            </slot>
            <slot v-if="i < state.displayItems.length - 1"
                  name="delimiter"
                  v-bind="{...props, index: i, item, value: item || ''}"
            >
                <span v-if="!state.isLineBreak"
                      class="delimiter"
                >{{ delimiter }}</span>
            </slot>
        </component>
    </span>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import {
    computed, reactive,
} from 'vue';


import type { TextListProps } from '@/data-display/text-list/type';
import PLink from '@/inputs/link/PLink.vue';
import { isNotEmpty } from '@/utils/helpers';

const props = withDefaults(defineProps<TextListProps>(), {
    items: () => [],
    delimiter: ', ',
});

const state = reactive({
    component: computed(() => (props.link ? PLink : 'span')),
    displayItems: computed(() => props.items.reduce((res, item) => {
        let data;
        if (typeof item === 'object' && props.subKey) {
            data = get(item, props.subKey, '');
        } else data = item;

        if (isNotEmpty(data)) res.push(data);
        return res;
    }, [] as string[])),
    isLineBreak: computed(() => ['<br>', '<br/>'].includes(props.delimiter)),
});

const getHref = () => {
    if (props.link) return props.link;
    return undefined;
};

</script>

<style lang="postcss">
.p-text-list {
    > .list-item {
        > .delimiter {
            white-space: pre;
        }
        &.line-break {
            display: block;
            margin-bottom: 0.25rem;
        }
    }
}
</style>
