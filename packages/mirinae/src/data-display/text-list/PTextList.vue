<template>
    <span class="p-text-list">
        <component :is="component"
                   v-for="(item, i) in displayItems"
                   :key="i"
                   class="list-item-wrapper"
                   :class="{'line-break': isLineBreak && i < displayItems.length - 1}"
                   :href="getHref()"
                   :target="linkTarget || undefined"
        >
            <slot name="default"
                  v-bind="{...$props, index: i, item, value: item}"
            >
                {{ item }}
            </slot>
            <slot v-if="i < displayItems.length - 1"
                  name="delimiter"
                  v-bind="{...$props, index: i, item, value: item}"
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

import type { TextListItem } from '@/data-display/text-list/type';
import PLink from '@/navigation/link/PLink.vue';
import { isNotEmpty } from '@/utils/helpers';

export default defineComponent({
    name: 'PTextList',
    components: { PLink },
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
            component: computed(() => (props.link ? PLink : 'span')),
            displayItems: computed(() => props.items.reduce((res: string[], item) => {
                let data: string;
                if (typeof item === 'object' && props.subKey) {
                    data = get(item, props.subKey, '');
                } else data = item as string;

                if (isNotEmpty(data)) res.push(data);
                return res;
            }, [] as string[]).map((item) => item ?? '')),
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
    > .list-item-wrapper {
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
