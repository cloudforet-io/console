<template>
    <span v-tooltip.bottom="invalid ? errorMessage : ''"
          class="p-tag"
          :class="{deletable: deletable, selected: selected, outline: outline, invalid: invalid}"
          v-on="$listeners"
    >
        <p-i v-if="invalid" class="invalid-icon"
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
             @click.stop="$emit('delete')"
        />
    </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';

interface Props {
    deletable?: boolean;
    outline?: boolean;
    selected?: boolean;
    invalid?: boolean;
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
        selected: {
            type: Boolean,
            default: false,
        },
        invalid: {
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
    @apply bg-gray-200 text-gray-dark rounded;
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    padding: 0.125rem 0.25rem 0.125rem 0.5rem;
    height: auto;
    max-width: 100%;
    width: fit-content;
    margin-right: 0.5rem;
    &.selected {
        @apply bg-blue-300;
    }

    &.deletable {
        .delete-icon {
            @apply text-gray-400;
            cursor: pointer;
            margin-top: 1px;
            flex-shrink: 0;
        }
        &:hover {
            cursor: pointer;
            .delete-icon {
                @apply text-gray-dark;
            }
        }
    }
    &.outline {
        @apply text-gray-dark bg-transparent border border-gray-200;
        &.selected {
            @apply bg-blue-200 border-blue-300;
        }
    }
    &.invalid {
        @apply bg-red-100 border border-alert;

        .invalid-icon {
            margin-right: 0.3rem;
        }
        &.selected {
            @apply bg-red-200 border-red-500;
        }
    }
    .text {
        font-size: 0.75rem;
        line-height: 1.4;
        white-space: normal;
        word-break: break-word;
        max-width: 100%;
        margin-right: 0.25rem;
    }
}
</style>
