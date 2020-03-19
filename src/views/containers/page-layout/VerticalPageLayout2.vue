<template>
    <p-vertical-layout2 v-bind="$props" v-on="$listeners">
        <template #sidebar="prop">
            <slot name="sidebar"
                  :width="prop.width"
            />
        </template>
        <template #default>
            <div class="right-container">
                <div class="page-contents">
                    <slot name="default" />
                </div>
                <div class="fnb">
                    <FNB />
                </div>
            </div>
        </template>
    </p-vertical-layout2>
</template>

<script>
    import styles from '@/styles/variables';

    import PVerticalLayout2 from '@/components/organisms/layouts/vertical-layout/VerticalLayout2.vue';
    import FNB from '@/views/containers/fnb/FNB.vue';

    export default {
        name: 'VerticalPageLayout2',
        components: { PVerticalLayout2, FNB },
        props: {
            height: {
                type: String,
                default: `calc(100vh - ${styles['lnb-height']})`,
            },
            initWidth: {
                type: Number,
                default: 300,
            },
            minWidth: {
                type: Number,
                default: 100,
            },
            maxWidth: {
                type: Number,
                default: 500,
            },
        },
    };
</script>

<style lang="postcss" scoped>
    .right-container {
        height: calc(100vh - $(lnb-height));
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
