<template>
    <p-pane-layout class="section">
        <p class="title">
            <slot name="title">
                {{ title }}
            </slot>
        </p>
        <slot v-if="isEmpty" name="empty">
            <p-empty>
                <div class="w-full mt-2">
                    {{ emptyText }}
                </div>
            </p-empty>
        </slot>
        <div v-else>
            <slot name="default" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { PEmpty, PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'SpotGroupAddSection',
    components: {
        PPaneLayout,
        PEmpty,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        isEmpty: {
            type: Boolean,
            default: false,
        },
        emptyText: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.section {
    padding: 2rem 1rem 2.5rem 1rem;
    margin-bottom: 1rem;
    .title {
        font-size: 1.5rem;
        line-height: 135%;
        margin-bottom: 1.125rem;
        vertical-align: middle;
    }
}
</style>
