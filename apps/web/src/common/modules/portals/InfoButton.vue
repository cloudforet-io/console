<script lang="ts" setup>
import { PI, PAnchor } from '@spaceone/design-system';
import {
    computed,
    onBeforeUnmount,
    reactive,
    useSlots, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

interface Props {
    visible: boolean;
    href?: string;
}

const props = defineProps<Props>();
const slots = useSlots();
const { t } = useI18n();
const store = useStore();

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
        store.dispatch('display/showInfo');
    } else {
        store.dispatch('display/hideSidebar');
    }
}, { immediate: true });

onBeforeUnmount(() => {
    store.dispatch('display/hideSidebar');
});

</script>

<template>
    <component :is="state.tag"
               v-bind="state.childProps"
               class="info-button"
               @click.stop="href ? undefined : store.dispatch('display/showInfo')"
    >
        <p-i name="ic_info-circle"
             width="0.875rem"
             height="0.875rem"
             color="inherit"
        />
        <span class="text">
            <slot name="button">{{ t('COMMON.INFO_BUTTON.INFO') }}</slot>
        </span>
    </component>
    <portal to="info-title">
        <slot name="title" />
    </portal>
    <portal to="info-contents">
        <div class="info-contents"
             :class="{'no-title': !slots.title }"
        >
            <slot name="contents" />
        </div>
    </portal>
</template>

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
