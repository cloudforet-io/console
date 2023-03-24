<template>
    <fragment>
        <component :is="tag"
                   v-bind="childProps"
                   class="info-button"
                   @click.stop="href ? undefined : $store.dispatch('display/showInfo')"
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
    getCurrentInstance,
    onBeforeUnmount,
    reactive,
    toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PI, PAnchor } from '@spaceone/design-system';

export default {
    name: 'InfoButton',
    components: {
        PI, PAnchor,
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
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            tag: computed(() => (props.href ? PAnchor : 'span')),
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
                vm.$store.dispatch('display/showInfo');
            } else {
                vm.$store.dispatch('display/hideSidebar');
            }
        }, { immediate: true });

        onBeforeUnmount(() => {
            vm.$store.dispatch('display/hideSidebar');
        });
        return {
            ...toRefs(state),
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
