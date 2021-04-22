<template>
    <p-badge v-tooltip.bottom="isError ? errorMessage : ''"
             class="p-tag"
             :class="{deletable: deletable, activated: activated, outline: outline, error: isError}"
             :style-type="styleType" shape="square" :outline="outline"
             v-on="$listeners"
    >
        <p-i v-if="isError" class="error-icon"
             name="ic_alert"
             width="0.8rem"
             height="0.8rem"
        />
        <slot />
        <p-i v-if="deletable"
             name="ic_delete"
             width="1rem"
             height="1rem"
             class="icon"
             color="inherit"
             @click="$emit('delete')"
        />
    </p-badge>
</template>

<script lang="ts">
import PBadge from '@/data-display/badges/PBadge.vue';
import PI from '@/foundation/icons/PI.vue';

export default {
    name: 'PTag',
    components: {
        PBadge,
        PI,
    },
    props: {
        deletable: {
            type: Boolean,
            default: true,
        },
        styleType: {
            type: String,
            default: 'gray200',
        },
        outline: {
            type: Boolean,
            default: false,
        },
        activated: {
            type: Boolean,
            default: false,
        },
        isError: {
            type: Boolean,
            default: false,
        },
        errorMessage: {
            type: String,
            default: '',
        },
    },
    setup() {
        return { };
    },
};
</script>

<style lang="postcss">
.p-tag {
    color: inherit;
    vertical-align: middle;
    white-space: nowrap;
    margin-right: 0.5rem;
    &.deletable {
        padding-right: 0.15rem;
        .icon {
            @apply text-gray-400;
            cursor: pointer;
            margin-left: 0.5rem;
        }
        &:hover {
            @apply bg-gray-100;

            &.outline, &.error {
                @apply border-gray-100;
            }

            .icon {
                @apply text-alert;
            }
        }
    }
    &.activated {
        @apply bg-blue-300;
    }
    &.outline {
        @apply text-gray-dark;
    }
    &.error {
        @apply bg-white border border-alert;

        .error-icon {
            margin-right: 0.3rem;
        }
    }
}
</style>
