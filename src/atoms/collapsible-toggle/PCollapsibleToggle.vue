<template>
    <span class="p-collapsible-toggle"
          @click="onClick"
          v-on="$listeners"
    >
        <span v-if="$scopedSlots.default">
            <slot name="default" />
        </span>
        <p-i class="p-collapsible-icon"
             width="0.875rem" height="0.875rem"
             :name="isCollapsed?'ic_arrow_bottom':'ic_arrow_top'"
             color="inherit transparent"
        />
    </span>
</template>

<script lang="ts">
import PI from '@/atoms/icons/PI.vue';

export default {
    name: 'PCollapsibleToggle',
    components: { PI },
    props: {
        isCollapsed: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }) {
        return {
            onClick() {
                emit('update:isCollapsed', !props.isCollapsed);
            },
        };
    },
};
</script>

<style lang="postcss">

.p-collapsible-toggle {
    @apply flex text-blue-600 cursor-pointer;
    font-size: 0.75rem;
    font-weight: 400;
    align-items: center;

    &:hover {
        text-decoration: underline;
    }
}
</style>
