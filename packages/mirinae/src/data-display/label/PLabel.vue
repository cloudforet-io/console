<template>
    <div class="p-label"
         :class="{ clickable, 'icon-label': leftIcon }"
         @click="handleClickLabel"
    >
        <span class="label-content">
            <slot name="label-content">
                <p-i v-if="leftIcon"
                     class="label-left-icon"
                     :name="leftIcon"
                     color="inherit"
                     width="0.75rem"
                     height="0.75rem"
                />
                <span>
                    {{ text }}
                </span>
            </slot>
        </span>

        <p-i v-if="deletable"
             name="ic_close"
             width="1rem"
             height="1rem"
             class="label-delete-icon"
             color="inherit"
             @click.stop="$emit('delete')"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SetupContext } from 'vue';

import PI from '@/foundation/icons/PI.vue';

interface LabelProps {
    leftIcon?: string;
    text?: string;
    clickable?: boolean;
    clickStop?: boolean;
    deletable?: boolean;
    active?: boolean;
}

export default defineComponent<LabelProps>({
    name: 'PLabel',
    components: {
        PI,
    },
    props: {
        leftIcon: {
            type: String,
            default: undefined,
        },
        text: {
            type: String,
            default: undefined,
        },
        clickable: {
            type: Boolean,
            default: false,
        },
        clickStop: {
            type: Boolean,
            default: true,
        },
        deletable: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const handleClickLabel = (e: Event) => {
            if (props.clickStop) e.stopPropagation();
            if (!props.clickable) return;
            emit('item-click');
        };

        return {
            handleClickLabel,
        };
    },
});
</script>

<style lang="postcss">
.p-label {
    @apply rounded border border-gray-200;
    display: inline-flex;
    align-items: center;
    height: 1.25rem;
    padding: 0 0.5rem;
    width: fit-content;
    margin-right: 0.375rem;
    box-sizing: border-box;

    .label-content {
        @apply text-gray-900;
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
        line-height: normal;
    }
    .label-left-icon {
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.125rem;
    }
    .label-delete-icon {
        @apply text-gray-400;
        cursor: pointer;
        margin-left: 0.25rem;
    }

    &.clickable {
        @apply bg-white;
        cursor: pointer;

        @media (hover: hover) {
            &:hover {
                @apply bg-blue-200 border-blue-400;

                .label-content {
                    @apply text-blue-600;
                }
            }
        }
    }
    &.icon-label {
        padding: 0 0.25rem;
    }
}
</style>
