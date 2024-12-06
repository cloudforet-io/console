<template>
    <fragment>
        <component :is="tag"
                   v-bind="childProps"
                   class="info-button"
                   @click.stop="href ? undefined : displayStore.showInfo()"
        >
            <p-i name="ic_info-circle"
                 width="0.875rem"
                 height="0.875rem"
                 color="inherit"
            />
            <span class="text">
                <slot name="button">{{ $t('COMMON.INFO_BUTTON.INFO') }}</slot>
            </span>
        </component>
        <portal to="info-title">
            <slot name="title" />
        </portal>
        <portal to="info-contents">
            <div class="info-contents"
                 :class="{'no-title': !$scopedSlots.title }"
            >
                <slot name="contents" />
            </div>
        </portal>
    </fragment>
</template>

<script lang="ts">
import {
    computed,
    onBeforeUnmount,
    reactive,
    toRefs, watch,
} from 'vue';

import { PI, PLink } from '@cloudforet/mirinae';

import { useDisplayStore } from '@/store/display/display-store';

export default {
    name: 'InfoButton',
    components: {
        PI, PLink,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        href: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const displayStore = useDisplayStore();

        const state = reactive({
            tag: computed(() => (props.href ? PLink : 'span')),
            childProps: computed(() => {
                const res: any = {};
                if (props.href) {
                    res.href = props.href;
                    res.target = '_blank';
                    res.showIcon = true;
                }
                return res;
            }),
        });

        watch(() => props.visible, (after) => {
            if (after) {
                displayStore.showInfo();
            } else {
                displayStore.setVisibleSidebar(false);
            }
        }, { immediate: true });

        onBeforeUnmount(() => {
            displayStore.setVisibleSidebar(false);
        });
        return {
            ...toRefs(state),
            displayStore,
        };
    },
};
</script>

<style lang="postcss" scoped>
.info-button {
    @apply inline-flex items-center text-gray-700;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.2;
    &:hover {
        @apply text-secondary;
        .text {
            text-decoration: underline;
        }
    }
    .text {
        @apply ml-1 mr-0;
    }
}

/* custom portal - info-contents */
:deep(.info-contents) {
    &.no-title {
        margin-top: -1rem;
    }
}
</style>
