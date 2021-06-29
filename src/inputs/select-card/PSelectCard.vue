<template>
    <div class="p-select-card" :class="{selected: isSelected, block, disabled}"
         @click="onClick"
         v-on="$listeners"
    >
        <p-i :name="iconName"
             class="marker" width="1.25rem" height="1.25rem"
        />
        <div class="contents">
            <slot v-bind="{isSelected}">
                <p-lazy-img v-if="imageUrl || icon" :src="imageUrl" :error-icon="errorIcon"
                            :error-icon-color="typeof icon === 'boolean' && icon ? 'inherit' : iconColor"
                            :width="block ? '1rem' : '3rem'" :height="block ? '1rem' : '3rem'"
                />
                <span v-if="label" class="label">{{ label }}</span>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import {
    SelectProps, useSelect,
} from '@/hooks/select';


interface Props extends SelectProps {
    block?: boolean;
    imageUrl?: string;
    icon?: string|boolean;
    iconColor?: string;
    label?: string;
}

export default defineComponent<Props>({
    name: 'PSelectCard',
    components: {
        PI,
        PLazyImg,
    },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        /* select props */
        selected: {
            type: [Boolean, String, Number, Object, Array],
            default: undefined,
        },
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        predicate: {
            type: Function,
            default: undefined,
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        /* select card props */
        block: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: String,
            default: undefined,
        },
        icon: {
            type: [String, Boolean],
            default: undefined,
        },
        iconColor: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: '',
        },
    },
    setup(props: Props, context) {
        const { state: selectState, onClick } = useSelect(props, context);

        const state = reactive({
            errorIcon: computed(() => {
                if (typeof props.icon === 'string') return props.icon;
                if (props.icon) return 'smile-face';
                return '';
            }),
        });

        const iconName = computed(() => {
            if (props.multiSelectable) {
                if (props.disabled) return 'ic_checkbox--disabled';
                if (state.isSelected) return 'ic_checkbox--checked';
                return 'ic_checkbox';
            }
            if (props.disabled) return 'ic_radio--disabled';
            if (state.isSelected) return 'ic_checkbox_circle--checked';
            return 'ic_radio';
        });

        return {
            ...toRefs(selectState),
            ...toRefs(state),
            onClick,
            iconName,
        };
    },
});
</script>

<style lang="postcss">
.p-select-card {
    @apply bg-white border-gray-200 text-gray-900 rounded;
    display: inline-block;
    position: relative;
    border-width: 1px;
    padding: 2rem 0.5rem;
    cursor: pointer;
    z-index: 0;
    min-width: 3rem;
    min-height: 3rem;
    &.block {
        display: block;
        width: 100%;
        .contents {
            flex-direction: row;
            .p-lazy-img {
                margin-right: 0.25rem;
                margin-bottom: 0;
            }
        }
    }
    &.selected {
        @apply border-secondary text-secondary;
    }
    &.disabled {
        @apply border-gray-200 text-gray-400;
        cursor: not-allowed;
    }
    .marker {
        @apply absolute;
        left: 0.75rem;
        top: 0.75rem;
        z-index: 1;
    }
    .contents {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;

        .p-lazy-img {
            @apply text-gray-200;
            margin-right: 0;
            margin-bottom: 1rem;
            flex-shrink: 0;
        }

        .label {
            color: inherit;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.2;
            text-align: center;
            word-break: break-word;
        }
    }

    @media (hover: hover) {
        &:hover {
            @apply bg-secondary2;
        }
    }
}
</style>
