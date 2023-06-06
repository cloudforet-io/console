<template>
    <div class="p-board-item"
         :class="{'rounded': rounded, 'selected': isSelected}"
         v-on="$listeners"
    >
        <div class="content-area">
            <slot name="left-content">
                <div v-if="leftIcon"
                     class="left-icon"
                >
                    <p-i :name="leftIcon"
                         width="2.5rem"
                         height="2.5rem"
                    />
                </div>
            </slot>
            <div class="content">
                <slot name="content" />
            </div>
            <div
                class="right-overlay-wrapper desktop"
            >
                <div class="overlay-contents">
                    <slot name="overlay-content" />
                    <div v-if="state.iconSetList.length">
                        <p-tooltip v-for="(iconAction, index) in state.iconSetList"
                                   :key="`${iconAction.iconName}-desktop-${index}`"
                                   class="overlay-icon-button"
                                   :contents="iconAction.tooltipText"
                                   position="bottom"
                        >
                            <p-icon-button :name="iconAction.iconName"
                                           @click.stop="iconAction.eventAction"
                            />
                        </p-tooltip>
                    </div>
                </div>
            </div>
            <div v-if="state.iconSetList.length > 0"
                 class="right-overlay-wrapper tablet"
            >
                <div class="overlay-contents">
                    <p-select-dropdown v-if="state.iconSetList.length > 1"
                                       :items="state.iconSetList"
                                       style-type="icon-button"
                                       button-icon="ic_more"
                                       use-fixed-menu-style
                    >
                        <template #menu-menu>
                            <div class="custom-button-menu">
                                <p-icon-button v-for="(iconAction, index) in state.iconSetList"
                                               :key="`${iconAction.iconName}-context-menu-${index}`"
                                               :name="iconAction.iconName"
                                               @click.stop="iconAction.eventAction"
                                />
                            </div>
                        </template>
                    </p-select-dropdown>
                    <p-tooltip v-else-if="state.iconSetList.length === 1"
                               class="overlay-icon-button"
                               :contents="state.iconSetList[0].tooltipText"
                               position="bottom"
                    >
                        <p-icon-button :name="state.iconSetList[0].iconName"
                                       @click.stop="state.iconSetList[0].eventAction"
                        />
                    </p-tooltip>
                </div>
            </div>
            <div v-else
                 class="right-overlay-wrapper"
            >
                <slot name="custom-right-content" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import type { BoardItemProps } from '@/data-display/board-item/type';
import PTooltip from '@/data-display/tooltips/PTooltip.vue';
import PI from '@/foundation/icons/PI.vue';
import { useSelect } from '@/hooks';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';

const props = withDefaults(defineProps<BoardItemProps>(), {
    iconButtonSets: () => [],
});

const state = reactive({
    iconSetList: computed(() => props.iconButtonSets ?? []),
});

const {
    isSelected,
} = useSelect({
    selected: computed(() => props.selected),
    value: computed(() => props.value),
    predicate: () => !!(props.selected && props.value && props.selected === props.value),
});

</script>

<style lang="postcss">
.p-board-item {
    @apply flex items-center bg-white border border-gray-200 relative;
    padding: 1rem;
    min-height: 4rem;
    box-sizing: border-box;
    &.rounded {
        @apply rounded-lg;
    }
    &.selectable {
        cursor: pointer;
    }
    &.selected {
        @apply bg-blue-200 relative;

        &::before {
            @apply absolute border-blue-600;
            width: calc(100% + 0.125rem);
            height: calc(100% + 0.125rem);
            left: -1px;
            border-width: 0.125rem !important;
            border-radius: inherit;
            content: '';
        }
    }

    &:hover {
        @apply bg-blue-100;
    }

    .content-area {
        @apply w-full h-full flex items-center overflow-hidden;
        .content {
            @apply flex-grow;
            line-height: normal;
        }
        .right-overlay-wrapper {
            @apply flex items-center bg-blue-100 absolute;
            top: 1rem;
            right: 1rem;

            .overlay-contents {
                @apply h-full w-full flex bg-blue-100;

                .overlay-icon-button {
                    height: 2rem;
                }
            }
        }
        .tablet {
            display: none;
            .custom-button-menu {
                @apply flex flex-col;
                padding: 0.5rem;
            }
        }
        .left-icon {
            @apply h-full;
            margin-right: 0.75rem;
        }
    }

    &:not(:hover) {
        .right-overlay-wrapper {
            display: none;
        }
    }

    @screen tablet {
        .content-area {
            .desktop {
                display: none;
            }
            .tablet {
                display: flex;
            }
        }
        &:not(:hover) {
            .tablet {
                display: none;
            }
        }
    }
}
</style>
