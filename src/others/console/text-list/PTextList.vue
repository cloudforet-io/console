<template>
    <span class="p-text-list">
        <component :is="component"
                   v-for="(item, i) in displayItems"
                   :key="i"
                   class="list-item"
                   :class="{'line-break': isLineBreak && i < displayItems.length - 1}"
                   :href="getHref(item, i)"
                   :target="target || undefined"
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

import PAnchor from '@/inputs/anchors/PAnchor.vue';
import type { TextListItem } from '@/others/console/text-list/type';
import { isNotEmpty } from '@/utils/helpers';

export default defineComponent({
    name: 'PTextList',
    components: { PAnchor },
    props: {
        items: {
            // FIXME:: below any type
            type: Array as PropType<any>,
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
        tag: {
            type: String,
            default: 'span',
        },
        link: {
            type: String,
            default: undefined,
        },
        target: {
            type: String,
            default: undefined,
        },
        linkFormatter: {
            type: Function,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            component: computed(() => (props.link ? PAnchor : (props.tag || 'span'))),
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

        const getHref = (item: TextListItem, idx: number) => {
            if (props.link) return props.link;
            if (props.linkFormatter) return props.linkFormatter(item, idx);
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
