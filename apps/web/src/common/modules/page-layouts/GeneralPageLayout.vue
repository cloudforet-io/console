<template>
    <div class="general-page-layout"
         :class="overflow"
    >
        <div class="header">
            <slot name="handbook" />
        </div>

        <div class="page-contents">
            <slot />
        </div>
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

import FNB from '@/common/modules/navigations/FNB.vue';

export default {
    name: 'GeneralPageLayout',
    components: { FNB },
    props: {
        overflow: {
            type: String as PropType<'auto'|'scroll'>,
            default: 'auto',
        },
    },
};
</script>

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
        padding: 1.5rem 1.5rem 0.25rem 1.5rem;
        &.without-breadcrumbs {
            padding: 0;
        }
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
