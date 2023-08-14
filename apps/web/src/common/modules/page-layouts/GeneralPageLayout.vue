<script lang="ts" setup>
import { PBreadcrumbs } from '@spaceone/design-system';
import { computed, reactive } from 'vue';


import FNB from '@/common/modules/navigations/FNB.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface Props {
    breadcrumbs?: Breadcrumb[];
    overflow?: 'auto'|'scroll';
}

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    overflow: 'auto',
});

const state = reactive({
    copiable: computed(() => {
        // eslint-disable-next-line no-unsafe-optional-chaining
        const last = props.breadcrumbs?.[props.breadcrumbs?.length - 1];
        return last?.copiable;
    }),
});

</script>

<template>
    <div class="general-page-layout"
         :class="overflow"
    >
        <div class="header"
             :class="{'without-breadcrumbs': !breadcrumbs.length}"
        >
            <p-breadcrumbs v-if="breadcrumbs.length"
                           :routes="breadcrumbs"
                           :copiable="state.copiable"
            />
            <slot name="handbook" />
        </div>

        <div class="page-contents"
             :class="{'without-breadcrumbs': !breadcrumbs.length}"
        >
            <slot />
        </div>
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.general-page-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: stretch;
    &.auto {
        overflow: auto;
    }
    &.scroll {
        overflow: scroll;
    }

    .header {
        @apply flex justify-between;
        padding: 1.5rem 1.5rem 0.25rem;
        &.without-breadcrumbs {
            padding: 0;
        }
    }
    .page-contents {
        width: 100%;
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
