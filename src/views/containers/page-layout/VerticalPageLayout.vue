<template>
    <div>
        <p-vertical-layout v-bind="$props" v-on="$listeners">
            <template #leftContainer="prop">
                <slot name="leftContainer"
                      :width="prop.width"
                      :widthRaw="prop.widthRaw"
                />
            </template>
            <template #dragger>
                <slot name="dragger" />
            </template>
            <template #rightContainer="prop">
                <div class="right-container" :style="{height: prop.height}">
                    <div class="page-contents">
                        <slot name="rightContainer" />
                    </div>
                    <div class="fnb">
                        <FNB />
                    </div>
                </div>
            </template>
        </p-vertical-layout>
    </div>
</template>

<script>
import styles from '@/styles/variables';

import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import FNB from '@/views/containers/fnb/FNB.vue';

export default {
    name: 'VerticalPageLayout',
    components: { PVerticalLayout, FNB },
    props: {
        height: {
            type: String,
            default: `calc(100vh - ${styles['lnb-height']})`,
        },
        line: {
            type: Boolean,
            default: true,
        },
        leftWidth: {
            type: Number,
            default: 278,
        },
        minLeftWidth: {
            type: Number,
            default: 150,
        },
        maxLeftWidth: {
            type: Number,
            default: 600,
        },
        totalWidth: {
            type: String,
            default: `calc(100vw -${styles['gnb-width']})`,
        },
        autoSaveLeftWidth: {
            type: Boolean,
            default: true,
        },
        minLeftSize: {
            type: Number,
            default: 16,
        },
    },
};
</script>

<style lang="postcss" scoped>
.right-container {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    .page-contents {
        width: 100%;
        flex-grow: 1;
        padding-top: 1.5625rem;
        padding-left: 2rem;
        padding-right: 2rem;
    }
    .fnb {
        width: 100%;
    }
}
</style>
