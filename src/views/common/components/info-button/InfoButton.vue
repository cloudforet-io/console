<template>
    <fragment>
        <component :is="tag" v-bind="childProps" class="info-button"
                   @click.stop="href ? undefined : $store.dispatch('display/showInfo')"
        >
            <p-i name="ic_outlined-info"
                 width="0.875rem" height="0.875rem"
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
            <div class="info-contents" :class="{'no-title': !!$scopedSlots.title }">
                <slot name="contents" />
            </div>
        </portal>
    </fragment>
</template>

<script lang="ts">
import { PI, PAnchor } from '@spaceone/design-system';
import {
    ComponentRenderProxy,
    computed,
    getCurrentInstance,
    onBeforeUnmount,
    reactive,
    toRefs, watch,
} from '@vue/composition-api';

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
        external: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            tag: computed(() => (props.href ? PAnchor : 'span')),
            childProps: computed(() => {
                const res: any = {};
                if (props.href) {
                    res.href = props.href;
                    res.highlight = true;
                    if (props.external) {
                        res.target = '_blank';
                        res.showIcon = true;
                    } else {
                        res.target = '_self';
                        res.showIcon = false;
                    }
                }
                return res;
            }),
        });

        watch(() => props.visible, (after, before) => {
            if (after) {
                vm.$store.dispatch('display/showInfo');
            } else {
                vm.$store.dispatch('display/hideInfo');
            }
        }, { immediate: true });

        onBeforeUnmount(() => {
            vm.$store.dispatch('display/hideInfo');
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
    .text {
        @apply ml-1;
        font-size: 0.75rem;
        line-height: 1.2;
    }
}
.info-contents::v-deep {
    &.no-data {
        margin-top: -1rem;
    }
}
</style>
