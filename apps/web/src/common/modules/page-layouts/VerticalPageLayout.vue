'<template>
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

<script lang="ts">
import { ref, watch } from 'vue';

import { PVerticalLayout } from '@spaceone/design-system';

import { useGlobalUIStore } from '@/store/global-ui/global-ui-store';

import FNB from '@/common/modules/navigations/FNB.vue';

export default {
    name: 'VerticalPageLayout',
    components: { PVerticalLayout, FNB },
    props: {
        initWidth: {
            type: Number,
            default: 260,
        },
        minWidth: {
            type: Number,
            default: 260,
        },
        maxWidth: {
            type: Number,
            default: 400,
        },
    },
    setup(props) {
        const containerRef = ref<HTMLElement|null>(null);

        watch(() => props.breadcrumbs, () => {
            const container = containerRef.value;
            if (container) {
                container.scrollTo(0, 0);
            }
        });

        const globalUIStore = useGlobalUIStore();
        const globalUIGetters = globalUIStore.getters;

        return {
            containerRef,
            globalUIGetters,
        };
    },
};
</script>

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
        max-width: 1920px;
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
