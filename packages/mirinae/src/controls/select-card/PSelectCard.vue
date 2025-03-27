<template>
    <div class="p-select-card"
         :class="{selected: isSelected, block, disabled}"
         :tabindex="tabIndex"
         @click="handleClick"
         v-on="$listeners"
         @keydown="handleKeydown"
    >
        <p-i v-if="showSelectMarker"
             :name="markerIconName"
             class="marker"
             width="1.25rem"
             height="1.25rem"
        />
        <div class="select-card-contents">
            <slot v-bind="{isSelected}">
                <p-lazy-img v-if="imageUrl || icon"
                            :src="imageUrl"
                            :error-icon="errorIcon"
                            :error-icon-color="typeof icon === 'boolean' && icon ? 'inherit' : iconColor"
                            :width="block ? '1rem' : '3rem'"
                            :height="block ? '1rem' : '3rem'"
                />
                <span v-if="label"
                      class="label"
                >{{ label }}</span>
            </slot>
            <slot name="bottom" />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PI from '@/foundation/icons/PI.vue';
import type { SelectionPredicate } from '@/hooks/use-select/use-select';
import { useSelect } from '@/hooks/use-select/use-select';





export default defineComponent({
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
            type: [Boolean, String, Number, Object, Array] as PropType<any|any[]>,
            default: undefined,
        },
        value: {
            type: [Boolean, String, Number, Object, Array] as PropType<any>,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        predicate: {
            type: Function as PropType<SelectionPredicate>,
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
            type: [String, Boolean] as PropType<string|boolean>,
            default: undefined,
        },
        iconColor: {
            type: String,
            default: '',
        },
        label: {
            type: String as PropType<TranslateResult>,
            default: '',
        },
        // FIXME:: tabIndex should be a required member;
        tabIndex: {
            type: Number as PropType<number|undefined>,
            default: undefined,
        },
        showSelectMarker: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }: SetupContext) {
        const {
            isSelected,
            getSelected,
        } = useSelect({
            value: computed(() => props.value),
            selected: computed(() => props.selected),
            predicate: computed(() => props.predicate),
            disabled: computed(() => props.disabled),
            multiSelectable: computed(() => props.multiSelectable),
        });

        const state = reactive({
            markerIconName: computed(() => {
                if (props.multiSelectable) {
                    if (props.disabled) return 'ic_checkbox-disabled';
                    if (isSelected.value) return 'ic_checkbox-selected';
                    return 'ic_checkbox';
                }
                if (props.disabled) return 'ic_radio-disabled';
                if (isSelected.value) return 'ic_checkbox-circle-selected';
                return '';
            }),
            errorIcon: computed(() => {
                if (typeof props.icon === 'string') return props.icon;
                if (props.icon) return 'ic_face-smile';
                return '';
            }),
        });

        /* event */
        const handleClick = () => {
            const newSelected = getSelected();
            if (props.multiSelectable) {
                emit('change', newSelected, !isSelected.value);
            } else {
                emit('change', newSelected, true);
            }
        };

        // FIXME:: Modularize keyboard event
        const handleKeydown = (e: KeyboardEvent) => {
            if (typeof props.tabIndex !== 'number'
                || !e.key.includes('Arrow')
                || props.multiSelectable
            ) return;

            // sibling means other cards on the same depth
            const siblings = (e?.target as HTMLDivElement)?.parentElement?.children as HTMLDivElement[]|undefined;
            if (!siblings) return;
            const lastIndex = siblings.length - 1;

            let nextTarget = 0;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (props.tabIndex === lastIndex) nextTarget = 0;
                else nextTarget = props.tabIndex + 1;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (props.tabIndex === 0) nextTarget = lastIndex;
                else nextTarget = props.tabIndex - 1;
            }

            siblings[nextTarget].focus();
            siblings[nextTarget].click();
        };

        return {
            ...toRefs(state),
            isSelected,
            handleClick,
            handleKeydown,
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
        .contents {
            opacity: 20%;
        }
    }
    .marker {
        @apply absolute;
        left: 0.75rem;
        top: 0.75rem;
        z-index: 1;
    }
    .select-card-contents {
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
        &:hover:not(.disabled) {
            @apply bg-secondary2;
        }
    }
}
</style>
