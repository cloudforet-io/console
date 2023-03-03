<template>
    <p-pane-layout class="collector-progress-wizard">
        <slot name="top">
            <slot name="progress">
                <div class="progress-tab-nav">
                    <div v-for="(tab, idx) in tabs"
                         :key="tab.name"
                         class="tab-nav-item"
                         :class="{
                             active: idx === proxyActiveIdx,
                             invalid: invalidState[tab.name],
                         }"
                         :style="{width: tabWidth}"
                         @click="onChangeTab(idx)"
                    >
                        <span class="triangle-bg" />
                        <span class="triangle" />
                        <slot :name="`progress-${tab.name}`"
                              :tab="tab"
                        >
                            <span>{{ Number(idx) + 1 }}.
                                {{ tab.label || tab.name }} {{ tab.optional ? `(${$t('PLUGIN.COLLECTOR.CREATE.PROGRESS_WIZARD.OPTIONAL')})`: '' }}
                            </span>
                        </slot>
                    </div>
                </div>
            </slot>
            <template v-if="activeTab">
                <aside v-if="activeTab.alert"
                       class="caution"
                >
                    <p-i name="ic_error-filled"
                         height="1rem"
                         width="1rem"
                    />
                    {{ activeTab.alert }}
                </aside>
                <aside v-if="activeTab.warning"
                       class="caution warning"
                >
                    <p-i name="ic_error-filled"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                    />
                    {{ activeTab.warning }}
                </aside>
            </template>
        </slot>

        <template v-if="activeTab">
            <div class="contents">
                <keep-alive>
                    <slot :name="`contents-${activeTab.name}`"
                          :tab="activeTab"
                    />
                </keep-alive>
            </div>
        </template>

        <slot name="bottom">
            <div class="bottom">
                <p-button style-type="tertiary"
                          :disabled="loading"
                          size="lg"
                          class="txt-btn"
                          @click="$emit('cancel', $event)"
                >
                    {{ $t('PLUGIN.COLLECTOR.CREATE.PROGRESS_WIZARD.CANCEL') }}
                </p-button>
                <div class="nav-btn-box">
                    <p-button v-if="!isFirstTab"
                              :disabled="loading"
                              style-type="highlight"
                              size="lg"
                              @click="onClickPrev"
                    >
                        <p-i name="ic_arrow-left"
                             color="inherit"
                        />{{ $t('PLUGIN.COLLECTOR.CREATE.PROGRESS_WIZARD.PREV') }}
                    </p-button>
                    <p-button v-if="!isLastTab"
                              :disabled="loading"
                              style-type="highlight"
                              size="lg"
                              @click="onClickNext"
                    >
                        {{ $t('PLUGIN.COLLECTOR.CREATE.PROGRESS_WIZARD.NEXT') }}
                        <p-i name="ic_arrow-left"
                             color="inherit"
                             dir="down"
                        />
                    </p-button>
                    <p-button :loading="loading"
                              :disabled="disabled"
                              class="txt-btn"
                              style-type="highlight"
                              size="lg"
                              @click="$emit('confirm', tabs, $event)"
                    >
                        {{ $t('PLUGIN.COLLECTOR.CREATE.PROGRESS_WIZARD.CONFIRM') }}
                    </p-button>
                </div>
            </div>
        </slot>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed,
} from 'vue';

import { PI, PButton, PPaneLayout } from '@spaceone/design-system';
import { size } from 'lodash';

import { useProxyValue } from '@/common/composables/proxy-state';


interface ProgressTab {
    name: string;
    label?: string;
    help?: string;
    optional?: string;
}
interface ProgressWizardProps {
    tabs: ProgressTab[];
    activeIdx: number;
    invalidState: {
        [key: string]: boolean;
    };
    loading: boolean;
    disabled: boolean;
}

export default {
    name: 'CollectorProgressWizard',
    components: {
        PPaneLayout,
        PI,
        PButton,
    },
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        /** sync */
        activeIdx: {
            type: Number,
            default: 0,
        },
        invalidState: {
            type: Object,
            default: () => ({}),
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ProgressWizardProps, { emit }) {
        const state = reactive({
            tabWidth: computed(() => `${100 / size(props.tabs)}%`),
            proxyActiveIdx: useProxyValue('activeIdx', props, emit),
            activeTab: computed(() => props.tabs[state.proxyActiveIdx]),
            isFirstTab: computed(() => state.proxyActiveIdx - 1 < 0),
            isLastTab: computed(() => state.proxyActiveIdx + 1 >= props.tabs.length),
        });

        const onClickPrev = () => {
            if (state.isFirstTab) return;
            emit('changeStep', state.proxyActiveIdx, state.proxyActiveIdx - 1);
            state.proxyActiveIdx -= 1;
        };
        const onClickNext = () => {
            if (state.isLastTab) return;
            emit('changeStep', state.proxyActiveIdx, state.proxyActiveIdx + 1);
            state.proxyActiveIdx += 1;
        };

        const onChangeTab = (idx) => {
            if (props.activeIdx !== idx) {
                emit('changeStep', props.activeIdx, idx);
                state.proxyActiveIdx = idx;
            }
        };

        return {
            ...toRefs(state),
            onClickPrev,
            onClickNext,
            onChangeTab,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-progress-wizard {
    $height: 2.5rem;

    @define-mixin triangle-color $size, $color {
        border-left: $size solid $color;
    }

    @define-mixin triangle $size, $z-idx, $color {
        position: absolute;
        right: calc($(size) * -1);
        z-index: $z-idx;
        width: 0;
        height: 0;
        border-top: $size solid transparent;
        border-bottom: $size solid transparent;

        @mixin triangle-color $size, $color;
    }

    .progress-tab-nav {
        @apply flex w-full items-center justify-center;
        height: $height;
        .tab-nav-item {
            @apply relative flex items-center justify-center h-full p-0 text-sm cursor-pointer bg-white border-t border-b border-black text-black;
            flex: 1 1 auto;
            .triangle {
                @mixin triangle calc(($(height) / 2) - 1px), 2, theme('colors.white');
            }
            .triangle-bg {
                @mixin triangle calc($(height) / 2), 1, theme('colors.black');
            }
            &:last-child {
                @apply border-r border-black rounded-r-lg;
                .triangle, .triangle-bg {
                    display: none;
                }
            }
            &:first-child {
                @apply border-l border-black rounded-l-lg;
            }
            &.active {
                @apply text-lg font-bold bg-black text-white;
                .triangle {
                    @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.black');
                }
                .triangle-bg {
                    @mixin triangle-color calc($(height) / 2), theme('colors.black');
                }
            }
            &.invalid {
                @apply border-alert text-alert bg-white;
                .triangle {
                    @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.white');
                }
                .triangle-bg {
                    @mixin triangle-color calc($(height) / 2), theme('colors.alert');
                }
                &.active {
                    @apply bg-alert border-alert text-white;
                    .triangle {
                        @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.alert');
                    }
                }
            }
            .help {
                margin-left: 0.5rem;
            }
        }
    }

    padding: 1.5rem 1rem 1rem 1rem;
    .step-head {
        @apply flex w-full border-b border-gray-200 pb-3;
        margin-top: 2.375rem;
        .step-title {
            @apply text-lg;
            line-height: 120%;
        }
        .step {
            @apply mr-4;
        }
        .title {
            @apply font-bold;
        }
        .optional {
            font-style: italic;
        }
    }
    .step-appendix {
        display: flex;
        flex-grow: 1;
        justify-content: flex-end;
    }
    .caution {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        padding-top: 1rem;
        .p-i-icon {
            margin-right: 0.5rem;
        }
        &.warning {
            @apply text-coral;
        }
    }
    .txt-btn {
        line-height: 1.5rem;
    }
    .contents {
        min-height: 360px;
    }
    .bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .nav-btn-box {
            display: inline-flex;
            align-items: center;
            .p-button {
                margin-left: 1.5rem;
            }
        }
    }
}
</style>
