<template>
    <p-pane-layout class="p-card-item" v-on="$listeners">
        <div flex-shrink-0>
            <slot name="side">
                <p-lazy-img :img-url="icon"
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
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import { cardItemProps } from '@/components/molecules/cards/PCardItem.toolset';
import { defineComponent } from '@vue/composition-api';

export default {
    name: 'PCardItem',
    components: {
        PPaneLayout, PLazyImg,
    },
    props: cardItemProps,
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.p-card-item {
    @apply flex p-4;
    &:hover {
        box-shadow: 0 0 8px rgba(theme('colors.primary'), 0.22);
    }
    .p-card-body {
        @apply w-full h-full pl-6 overflow-hidden;
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
