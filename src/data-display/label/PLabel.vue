<template>
    <div class="p-label"
         :class="{ clickable, active: proxyActive, 'icon-label': leftIcon }"
         @click.stop="handleClickLabel"
    >
        <span class="label-content">
            <slot name="label-content">
                <p-i v-if="leftIcon" class="left-icon"
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
             name="ic_delete"
             width="1rem"
             height="1rem"
             class="delete-icon"
             color="inherit"
             @click.stop="$emit('delete')"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import type { SetupContext } from 'vue';

import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';

interface LabelProps {
    leftIcon?: string;
    text?: string;
    clickable?: boolean;
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
        const state = reactive({
            proxyActive: useProxyValue('active', props, emit),
        });

        const handleClickLabel = () => {
            if (!props.clickable) return;
            state.proxyActive = !state.proxyActive;
            emit('item-click');
        };
        return {
            ...toRefs(state),
            handleClickLabel,
        };
    },
});
</script>

<style lang="postcss">
.p-label {
    @apply bg-white rounded border border-gray-200;
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
    .left-icon {
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.125rem;
    }
    .delete-icon {
        @apply text-gray-400;
        cursor: pointer;
        margin-left: 0.25rem;
    }

    &.clickable {
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
    &.active {
        @apply bg-blue-200 border-blue-600;
        .label-content {
            @apply text-blue-600;
        }
    }
    &.icon-label {
        padding: 0 0.25rem;
    }
}
</style>
