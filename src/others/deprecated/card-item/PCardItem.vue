<template>
    <p-pane-layout class="p-card-item" v-on="$listeners">
        <div>
            <slot name="side">
                <p-lazy-img :src="icon"
                            :error-icon="defaultIcon"
                            width="4.5rem" height="4.5rem"
                />
            </slot>
        </div>
        <div class="p-card-body">
            <slot name="body">
                <header class="title">
                    <slot name="title">
                        {{ title }}
                    </slot>
                </header>
                <span class="contents">
                    {{ contents }}
                </span>
            </slot>
            <slot name="extra" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';

export default {
    name: 'PCardItem',
    components: {
        PPaneLayout, PLazyImg,
    },
    props: {
        icon: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        contents: {
            type: String,
            default: '',
        },
        defaultIcon: {
            type: String,
            default: 'ic_collector_tags',
        },
    },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss">
.p-card-item {
    display: flex;
    padding: 1rem;
    &:hover {
        box-shadow: 0 0 8px rgba(theme('colors.primary'), 0.22);
    }
    .p-card-body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        padding-left: 1.5rem;
        .title {
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.125rem;
            padding-bottom: 0.5rem;
        }
        .contents {
            font-size: 0.875rem;
        }
    }
}
</style>
