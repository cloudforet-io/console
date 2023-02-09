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
            >
                <div class="header">
                    <p-breadcrumbs v-if="breadcrumbs.length"
                                   :routes="breadcrumbs"
                                   :copiable="copiable"
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

<script lang="ts">
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import { PBreadcrumbs, PVerticalLayout } from '@spaceone/design-system';

import FNB from '@/common/modules/navigations/FNB.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

export default {
    name: 'VerticalPageLayout',
    components: { PVerticalLayout, PBreadcrumbs, FNB },
    props: {
        height: {
            type: String,
            default: '100%',
        },
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
        breadcrumbs: {
            type: Array as PropType<Breadcrumb[]>,
            default: () => [],
        },
    },
    setup(props) {
        const containerRef = ref(undefined);

        return {
            containerRef,
            copiable: computed(() => {
                const last = props.breadcrumbs?.[props.breadcrumbs.length - 1];
                return last?.copiable;
            }),
        };
    },
};
</script>

<style lang="postcss" scoped>
.right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    overflow-y: scroll;

    .header {
        @apply flex justify-between;
        padding: 1.5rem 1.5rem 0.25rem 1.5rem;
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
