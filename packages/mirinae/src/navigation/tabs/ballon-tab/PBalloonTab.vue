<template>
    <div ref="tabContainerRef"
         class="p-balloon-tab"
         :class="[tabPosition, styleType, size]"
    >
        <div class="balloon-group"
             :class="{stretch}"
        >
            <button v-for="(tab, idx) in tabItems"
                    :key="tab.name"
                    ref="buttonRefs"
                    :class="{
                        active: activeTab === tab.name,
                        tail: tail && !isTabItemsOverTwoLines
                    }"
                    @click="handleClickTab(tab, idx)"
            >
                <slot name="tab"
                      v-bind="tab"
                >
                    {{ tab.label }}
                </slot>
            </button>
        </div>
        <div ref="paneRef"
             class="tab-pane"
        >
            <slot />
            <keep-alive>
                <slot v-if="keepAliveTabNames.includes(activeTab)"
                      :name="activeTab"
                      v-bind="currentTabItem"
                />
            </keep-alive>
            <slot v-if="nonKeepAliveTabNames.includes(activeTab)"
                  :name="activeTab"
                  v-bind="currentTabItem"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, onMounted, onUnmounted, onUpdated,
} from 'vue';


import { useTab } from '@/hooks/tab';
import {
    BALLOON_TAB_POSITION, BALLOON_TAB_SIZE, BALLOON_TAB_STYLE_TYPE,
} from '@/navigation/tabs/ballon-tab/config';
import type { BalloonTabProps } from '@/navigation/tabs/ballon-tab/type';
import type { TabItem } from '@/navigation/tabs/tab/type';

import screens from '@/styles/screens.cjs';


export default {
    name: 'PBalloonTab',
    model: {
        prop: 'activeTab',
        event: 'update:activeTab',
    },
    props: {
        /* tab item props */
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
        /* balloon props */
        tail: {
            type: Boolean,
            default: false,
        },
        styleType: {
            type: String,
            default: BALLOON_TAB_STYLE_TYPE.primary,
            validator(styleType: any) {
                return Object.values(BALLOON_TAB_STYLE_TYPE).includes(styleType);
            },
        },
        size: {
            type: String,
            default: BALLOON_TAB_SIZE.md,
            validator(size: any) {
                return Object.values(BALLOON_TAB_SIZE).includes(size);
            },
        },
        position: {
            type: String,
            default: BALLOON_TAB_POSITION.top,
            validator(position: any) {
                return Object.values(BALLOON_TAB_POSITION).includes(position);
            },
        },
        stretch: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: BalloonTabProps, { emit }) {
        const {
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
        } = useTab({
            tabs: computed(() => props.tabs),
            activeTab: computed(() => props.activeTab),
        });

        const state = reactive({
            tabContainerRef: null as HTMLElement|null,
            buttonRefs: [] as HTMLElement[],
            paneRef: null as HTMLElement|null,
            isTabItemsOverTwoLines: false,
            tabPosition: props.position,
        });

        /* util */
        const checkTabItemsOverflows = () => {
            if (!state.buttonRefs[0] || !state.paneRef) return;

            const button = state.buttonRefs[0].getBoundingClientRect();
            const pane = state.paneRef.getBoundingClientRect();
            let diff = 0;

            switch (state.tabPosition) {
            case BALLOON_TAB_POSITION.top: diff = pane.top - button.bottom; break;
            case BALLOON_TAB_POSITION.left: diff = button.right - pane.left; break;
            case BALLOON_TAB_POSITION.right: diff = button.left - pane.right; break;
            default: break;
            }

            state.isTabItemsOverTwoLines = diff > 10;
        };
        const setPosition = () => {
            if (window.innerWidth < screens.mobile.max) {
                state.tabPosition = BALLOON_TAB_POSITION.top;
            } else {
                state.tabPosition = props.position;
            }
        };
        const checkStyles = () => {
            checkTabItemsOverflows();
            setPosition();
        };

        /* event */
        const handleClickTab = (tab: TabItem, idx: number) => {
            if (props.activeTab !== tab.name) {
                emit('update:activeTab', tab.name);
                emit('change', tab.name, idx);
            }
        };

        onUpdated(() => {
            checkStyles();
        });

        onMounted(() => {
            checkStyles();
        });

        window.addEventListener('resize', checkStyles);

        onUnmounted(() => {
            window.removeEventListener('resize', checkStyles);
        });

        return {
            ...toRefs(state),
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
            handleClickTab,
        };
    },
};
</script>

<style lang="postcss">
.p-balloon-tab {
    display: flex;
    width: 100%;
    .balloon-group {
        display: flex;
        flex-shrink: 0;
        flex-wrap: wrap;
        width: calc(100% + 1rem);
        &.stretch {
            flex-grow: 1;
            button {
                flex-grow: 1;
            }
        }
        button {
            @apply bg-white border border-gray-200 rounded-lg;
            position: relative;
            display: inline-block;
            line-height: 1.6;
            font-size: 1rem;
            cursor: pointer;
            white-space: nowrap;
            filter: drop-shadow(0 2px 4px rgba(theme('colors.black'), 0.06));
            &.tail {
                &::after {
                    position: absolute;
                    content: '';
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-color: inherit;
                }
                &:not(.active)::after {
                    display: none;
                }
            }

            @media (hover: hover) {
                &:hover:not(.active) {
                    @apply bg-blue-100;
                }
            }
        }
    }
    .tab-pane {
        flex-grow: 1;
        flex-shrink: 0;
    }

    /* sizes */
    &.lg {
        .balloon-group {
            margin: -0.5rem;
            button {
                padding: 1.5rem 1rem;
                margin: 0.5rem;
            }
        }
    }
    &.md {
        .balloon-group {
            margin: -0.5rem;
            button {
                padding: 0.75rem 1rem;
                margin: 0.5rem;
            }
        }
    }
    &.sm {
        .balloon-group {
            margin: -0.375rem;
            button {
                padding: 0.375rem 1rem;
                margin: 0.375rem;
            }
        }
    }

    /* positions */
    $tail-size: 8px;
    &.top {
        flex-direction: column;
        .balloon-group {
            flex-direction: row;
        }
        button.tail::after {
            bottom: 0;
            left: 50%;
            transform: translate(-50%, 100%);
            border-left-color: transparent;
            border-right-color: transparent;
            border-width: $tail-size $tail-size 0 $tail-size;
        }
        .tab-pane {
            margin-top: $tail-size;
        }
    }
    &.right {
        flex-direction: row-reverse;
        .balloon-group {
            flex-direction: column;
            width: auto;
        }
        button {
            &.tail::after {
                top: 50%;
                left: 0;
                transform: translate(-100%, -50%);
                border-top-color: transparent;
                border-bottom-color: transparent;
                border-width: $tail-size $tail-size $tail-size 0;
            }
        }
        .tab-pane {
            margin-right: $tail-size;
        }
    }
    &.left {
        flex-direction: row;
        .balloon-group {
            flex-direction: column;
            width: auto;
        }
        button {
            &.tail::after {
                top: 50%;
                right: 0;
                transform: translate(100%, -50%);
                border-top-color: transparent;
                border-bottom-color: transparent;
                border-width: $tail-size 0 $tail-size $tail-size;
            }
        }
        .tab-pane {
            margin-left: $tail-size;
        }
    }

    /* style types */
    @define-mixin button-style $active-bg-color, $active-text-color {
        .balloon-group {
            button {
                &.active {
                    background-color: $active-bg-color;
                    border-color: $active-bg-color;
                    color: $active-text-color;
                }
            }
        }
    }

    &.primary {
        @mixin button-style theme('colors.primary1'), theme('colors.white');
    }
    &.peacock {
        @mixin button-style theme('colors.peacock.600'), theme('colors.white');
    }
    &.alert {
        @mixin button-style theme('colors.red.400'), theme('colors.white');
    }
    &.gray {
        @mixin button-style theme('colors.gray.400'), theme('colors.white');
    }
}
</style>
