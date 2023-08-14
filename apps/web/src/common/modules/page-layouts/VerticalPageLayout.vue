<script lang="ts" setup>
import { PBreadcrumbs, PVerticalLayout } from '@spaceone/design-system';
import {
    computed, reactive, ref, useAttrs, watch,
} from 'vue';


import FNB from '@/common/modules/navigations/FNB.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface Props {
    height?: string;
    initWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    breadcrumbs?: Breadcrumb[];
}

const props = withDefaults(defineProps<Props>(), {
    height: '100%',
    initWidth: 260,
    minWidth: 260,
    maxWidth: 400,
    breadcrumbs: () => [],
});
const attrs = useAttrs();

const containerRef = ref<HTMLElement|null>(null);
const state = reactive({
    copiable: computed(() => {
        const last = props.breadcrumbs?.[props.breadcrumbs.length - 1];
        return last?.copiable;
    }),
});

const listeners = {
    ...attrs,
};

watch(() => props.breadcrumbs, () => {
    const container = containerRef.value;
    if (container) {
        container.scrollTo(0, 0);
    }
});

</script>

'<template>
    <p-vertical-layout v-bind="props"
                       class="vertical-page-layout"
                       v-on="listeners"
    >
        <template #sidebar="prop">
            <slot name="sidebar"
                  :width="prop.width"
            />
        </template>
        <template #default>
            <div ref="containerRef"
                 class="right-container"
            >
                <div class="header">
                    <p-breadcrumbs v-if="breadcrumbs.length"
                                   :routes="breadcrumbs"
                                   :copiable="state.copiable"
                    />
                    <slot name="handbook" />
                </div>
                <div class="page-contents"
                     :class="{'without-breadcrumbs': !breadcrumbs.length}"
                >
                    <slot name="default" />
                </div>
                <div class="fnb">
                    <f-n-b />
                </div>
            </div>
        </template>
    </p-vertical-layout>
</template>

<style lang="postcss" scoped>
.right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    overflow-y: scroll;

    .header {
        @apply flex justify-between;
        padding: 1.5rem 1.5rem 0.25rem;
    }

    .page-contents {
        max-width: 1920px;
        flex-grow: 1;
        padding: 0 1.5rem 2rem;
        &.without-breadcrumbs {
            padding: 1.5rem 1.5rem 2rem;
        }
    }

    .fnb {
        width: 100%;
    }
}
</style>
