<template>
    <div class="general-page-layout">
        <div class="header">
            <p-breadcrumbs v-if="breadcrumbs.length" :routes="breadcrumbs" :copiable="copiable" />
            <slot name="handbook" />
        </div>

        <div class="page-contents" :class="{'without-breadcrumbs': !breadcrumbs.length}">
            <slot />
        </div>
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<script lang="ts">
import FNB from '@/common/modules/navigations/FNB.vue';
import { computed, PropType } from '@vue/composition-api';
import { Breadcrumb } from '@/common/modules/page-layouts/type';
import { PBreadcrumbs } from '@spaceone/design-system';

export default {
    name: 'GeneralPageLayout',
    components: { PBreadcrumbs, FNB },
    props: {
        breadcrumbs: {
            type: Array as PropType<Breadcrumb[]>,
            default: () => [],
        },
    },
    setup(props) {
        return {
            copiable: computed(() => {
                const last = props.breadcrumbs?.[props.breadcrumbs?.length - 1];
                return last?.copiable;
            }),
        };
    },
};
</script>

<style lang="postcss" scoped>
.general-page-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
    justify-content: stretch;

    .header {
        @apply flex justify-between;
    }
    .page-contents {
        width: 100%;
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
