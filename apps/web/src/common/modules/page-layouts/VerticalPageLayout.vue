<script lang="ts" setup>
import { ref, watch } from 'vue';

import { PVerticalLayout } from '@spaceone/design-system';

import { useGlobalUIStore } from '@/store/global-ui/global-ui-store';

import FNB from '@/common/modules/navigations/FNB.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface Props {
    breadcrumbs?: Breadcrumb[];
}

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: undefined,
});

const containerRef = ref<HTMLElement|null>(null);

const globalUIStore = useGlobalUIStore();
const globalUIGetters = globalUIStore.getters;

watch(() => props.breadcrumbs, () => {
    const container = containerRef.value;
    if (container) {
        container.scrollTo(0, 0);
    }
});
</script>

<template>
    <p-vertical-layout v-bind="$props"
                       class="vertical-page-layout"
                       v-on="$listeners"
    >
        <template #sidebar="prop">
            <slot name="sidebar"
                  :width="prop.width"
            />
        </template>
        <template #default>
            <div ref="containerRef"
                 class="right-container"
                 :style="{ height: globalUIGetters.appBodyHeight }"
            >
                <portal-target name="page-top-notification" />
                <div class="header">
                    <slot name="handbook" />
                </div>
                <div class="page-contents">
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
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    overflow-y: scroll;

    .header {
        @apply flex justify-between;
        padding: 1.5rem 1.5rem 0.25rem 1.5rem;
        &.without-breadcrumbs {
            padding: 0;
        }
    }

    .page-contents {
        flex-grow: 1;
        padding: 0 1.5rem 2rem 1.5rem;
        &.without-breadcrumbs {
            padding: 1.5rem 1.5rem 2rem 1.5rem;
        }
    }

    .fnb {
        width: 100%;
    }
}
</style>
