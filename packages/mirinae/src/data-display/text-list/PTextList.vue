<template>
    <span class="p-text-list">
        <component :is="component"
                   v-for="(item, i) in displayItems"
                   :key="i"
                   class="list-item"
                   :class="{'line-break': isLineBreak && i < displayItems.length - 1}"
                   :href="getHref(item, i)"
                   :target="linkTarget || undefined"
        >
            <slot name="default"
                  v-bind="{...$props, index: i, item, value: item || ''}"
            >
                {{ item || '' }}
            </slot>
            <slot v-if="i < displayItems.length - 1"
                  name="delimiter"
                  v-bind="{...$props, index: i, item, value: item || ''}"
            >
                <span v-if="!isLineBreak"
                      class="delimiter"
                >{{ delimiter }}</span>
            </slot>
        </component>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { get } from 'lodash';

import type { TextListItem, TextListProps } from '@/data-display/text-list/type';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { isNotEmpty } from '@/utils/helpers';

export default defineComponent<TextListProps>({
    name: 'PTextList',
    components: { PAnchor },
    props: {
        items: {
            type: Array as PropType<TextListItem>,
            default: () => [],
        },
        delimiter: {
            type: String,
            default: ', ',
        },
        subKey: {
            type: String,
            default: undefined,
        },
        link: {
            type: String,
            default: undefined,
        },
        linkTarget: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            component: computed(() => (props.link ? PAnchor : 'span')),
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


        return {
            ...toRefs(state),
            getHref,
        };
    },
});
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
