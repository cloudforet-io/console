'<template>
    <p-vertical-layout v-bind="$props" v-on="$listeners">
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
    </p-vertical-layout>
</template>

<script>
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/PVerticalLayout.vue';
import FNB from '@/views/containers/fnb/FNB.vue';

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
            default: 450,
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
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        .page-contents {
            width: 100%;
            flex-grow: 1;
            /*padding: 1.5rem 1.5rem 2rem;*/
            padding: 2rem 1.5rem;
            overflow-y: scroll;
        }

        .fnb {
            width: 100%;
        }
    }
</style>
