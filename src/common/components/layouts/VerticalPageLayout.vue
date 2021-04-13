'<template>
    <p-vertical-layout v-bind="$props" v-on="$listeners" class="vertical-page-layout">
        <template #sidebar="prop">
            <slot name="sidebar"
                  :width="prop.width"
            />
        </template>
        <template #default>
            <div ref="containerRef" class="right-container">
                <div class="page-contents">
                    <slot name="default" />
                </div>
                <div class="fnb">
                    <f-n-b />
                </div>
                <!--                <p-back-to-top-button :container="containerRef" />-->
            </div>
        </template>
    </p-vertical-layout>
</template>

<script lang="ts">
import { ref } from '@vue/composition-api';

import { PVerticalLayout } from '@spaceone/design-system';

import FNB from '@/common/modules/FNB.vue';

export default {
    name: 'VerticalPageLayout',
    components: { PVerticalLayout, FNB },
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
    },
    setup() {
        const containerRef = ref(undefined);

        return {
            containerRef,
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

    .page-contents {
        max-width: 1920px;
        flex-grow: 1;
        padding: 2rem 1.5rem;
    }

    .fnb {
        width: 100%;
    }
}
</style>
