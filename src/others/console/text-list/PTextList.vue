<template>
    <div class="p-text-list">
        <component :is="component" v-for="(item, i) in displayItems"
                   :key="i" class="list-item"
                   :href="getHref(item, i)"
                   :target="target || undefined"
        >
            <slot name="default" v-bind="{...$props, index: i, item, value: item || ''}">
                {{ item || '' }}
            </slot>
            <slot v-if="i < displayItems.length - 1" name="delimiter" v-bind="{...$props, index: i, item, value: item || ''}">
                <span class="delimiter" v-html="delimiter" />
            </slot>
        </component>
    </div>
</template>

<script lang="ts">
import { get } from 'lodash';
import { computed, reactive, toRefs } from '@vue/composition-api';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { TextListItem, TextListProps } from '@/others/console/text-list/type';
import { isNotEmpty } from '@/util/helpers';

export default {
    name: 'PTextList',
    components: { PAnchor },
    props: {
        items: {
            type: [Array],
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
    setup(props: TextListProps) {
        const state = reactive({
            component: computed(() => (props.link ? PAnchor : (props.tag || 'span'))),
            displayItems: computed(() => props.items.reduce((res, item, i) => {
                let data;
                if (typeof item === 'object' && props.subKey) {
                    data = get(item, props.subKey, '');
                } else data = item;

                if (isNotEmpty(data)) res.push(data);
                return res;
            }, [] as string[])),
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
};
</script>

<style lang="postcss">
.p-text-list {
    line-height: 1.8;
    .list-item.p-anchor:hover {
        @apply underline text-secondary cursor-pointer;
    }
}
</style>
