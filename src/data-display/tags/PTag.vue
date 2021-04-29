<template>
    <span v-tooltip.bottom="isError ? errorMessage : ''"
          class="p-tag"
          :class="{deletable: deletable, activated: activated, outline: outline, error: isError}"
          v-on="$listeners"
    >
        <p-i v-if="isError" class="error-icon"
             name="ic_alert"
             width="0.8rem"
             height="0.8rem"
        />
        <span class="text"><slot /></span>
        <p-i v-if="deletable"
             name="ic_delete"
             width="1rem"
             height="1rem"
             class="delete-icon"
             color="inherit"
             @click="$emit('delete')"
        />
    </span>
</template>

<script lang="ts">
import PI from '@/foundation/icons/PI.vue';
import { defineComponent } from '@vue/composition-api';

interface Props {
    deletable?: boolean;
    outline?: boolean;
    activated?: boolean;
    isError?: boolean;
    errorMessage?: string;
}

export default defineComponent<Props>({
    name: 'PTag',
    components: {
        PI,
    },
    props: {
        deletable: {
            type: Boolean,
            default: true,
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
});
</script>

<style lang="postcss">
.p-tag {
    @apply bg-gray-200 text-gray-dark;
    display: inline-flex;
    align-items: flex-start;
    overflow: hidden;
    padding: 0.125rem 0.25rem 0.125rem 0.5rem;
    height: auto;
    max-width: 100%;
    width: fit-content;
    margin-right: 0.5rem;
    border-radius: 4px;
    &.deletable {
        .delete-icon {
            @apply text-gray-400;
            cursor: pointer;
            margin-left: 0.25rem;
            margin-top: 1px;
            flex-shrink: 0;
        }
        &:hover {
            @apply bg-gray-100;

            &.outline, &.error {
                @apply border-gray-100;
            }

            .delete-icon {
                @apply text-alert;
            }
        }
    }
    &.activated {
        @apply bg-blue-300;
    }
    &.outline {
        @apply text-gray-dark bg-transparent border border-gray-200;
    }
    &.error {
        @apply bg-white border border-alert;

        .error-icon {
            margin-right: 0.3rem;
        }
    }
    .text {
        font-size: 0.75rem;
        line-height: 1.3;
        white-space: normal;
        word-break: break-word;
        max-width: 100%;
    }
}
</style>
