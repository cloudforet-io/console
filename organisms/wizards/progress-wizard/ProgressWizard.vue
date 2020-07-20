<template>
    <p-pane-layout class="p-progress-wizard">
        <slot name="top">
            <slot name="progress">
                <p-progress-tab-bar :tabs="tabs"
                                    :active-idx.sync="proxyActiveIdx"
                                    :invalid-state="invalidState"
                                    @changeTab="onChangeTab"
                >
                    <template v-for="(tab) in tabs" :slot="`progress-${tab.name}`">
                        <slot :name="`progress-${tab.name}`" />
                    </template>
                    <template v-for="(tab) in tabs" :slot="`help-${tab.name}`">
                        <slot :name="`help-${tab.name}`" />
                    </template>
                </p-progress-tab-bar>
            </slot>
            <template v-if="activeTab">
                <aside v-if="activeTab.alert" class="caution">
                    <p-i name="ic_alert" height="1rem" width="1rem" />
                    {{ activeTab.alert }}
                </aside>
                <aside v-if="activeTab.warning" class="caution warning">
                    <p-i name="ic_alert" height="1rem" width="1rem"
                         color="inherit"
                    />
                    {{ activeTab.warning }}
                </aside>
            </template>
        </slot>

        <template v-if="activeTab">
            <div class="step-head">
                <div class="step-title">
                    <span class="step">Step {{ proxyActiveIdx + 1 }}.</span>
                    <span class="title">{{ activeTab.label || activeTab.name }}</span>
                    <span v-if="activeTab.optional" class="optional"> ({{ $t('COMMON.OPTIONAL') }})</span>
                </div>
                <div class="step-appendix">
                    <slot :name="`step-append-${activeTab.name}`" :tab="activeTab" />
                </div>
            </div>
            <div class="contents">
                <keep-alive>
                    <slot :name="`contents-${activeTab.name}`" :tab="activeTab" />
                </keep-alive>
            </div>
        </template>

        <slot name="bottom">
            <div class="bottom">
                <p-button v-bind="mergedCancelBtnBind"
                          class="txt-btn" @click="$emit('cancel', $event)"
                >
                    {{ $t('BTN.CANCEL') }}
                </p-button>
                <div class="nav-btn-box">
                    <p-button v-if="!isFirstTab"
                              v-bind="mergedNavBtnBind"
                              @click="onClickPrev"
                    >
                        <p-i name="ic_back" color="transparent inherit" />{{ $t('COMMON.PREV') }}
                    </p-button>
                    <p-button v-if="!isLastTab"
                              v-bind="mergedNavBtnBind"
                              @click="onClickNext"
                    >
                        {{ $t('COMMON.NEXT') }}<p-i name="ic_back" color="transparent inherit" dir="down" />
                    </p-button>
                    <p-loading-button :button-bind="mergedConfirmBtnBind"
                                      :loading="loading"
                                      :disabled="disabled"
                                      class="txt-btn"
                                      @click="$emit('confirm', tabs, $event)"
                    >
                        {{ $t('BTN.CONFIRM') }}
                    </p-loading-button>
                </div>
            </div>
        </slot>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/PProgressTabBar.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import {
    ProgressWizardProps,
    progressWizardProps,
} from '@/components/organisms/wizards/progress-wizard/ProgressWizard.toolset';
import PLoadingButton from '@/components/molecules/buttons/loading-button/PLoadingButton.vue';


const setPagination = (props, state, emit) => {
    const isFirstTab = computed(() => state.proxyActiveIdx - 1 < 0);
    const isLastTab = computed(() => state.proxyActiveIdx + 1 >= props.tabs.length);

    const onClickPrev = () => {
        if (isFirstTab.value) return;
        emit('changeStep', state.proxyActiveIdx, state.proxyActiveIdx - 1);
        state.proxyActiveIdx -= 1;
    };
    const onClickNext = () => {
        if (isLastTab.value) return;
        emit('changeStep', state.proxyActiveIdx, state.proxyActiveIdx + 1);
        state.proxyActiveIdx += 1;
    };

    const onChangeTab = (now, beforeIdx) => {
        emit('changeStep', beforeIdx, now);
    };

    return {
        isFirstTab,
        isLastTab,
        onClickPrev,
        onClickNext,
        onChangeTab,
    };
};

export default {
    name: 'PProgressWizard',
    components: {
        PLoadingButton,
        PPaneLayout,
        PProgressTabBar,
        PI,
        PButton,
    },
    props: progressWizardProps,
    setup(props: ProgressWizardProps, { emit }) {
        const state = reactive({
            proxyActiveIdx: makeProxy('activeIdx', props, emit),
            activeTab: computed(() => props.tabs[state.proxyActiveIdx]),
            mergedCancelBtnBind: computed(() => ({
                styleType: 'gray900',
                size: 'lg',
                outline: true,
                ...props.cancelBtnBind,
            })),
            mergedNavBtnBind: computed(() => ({
                styleType: 'secondary',
                size: 'lg',
                outline: true,
                ...props.navigationBtnBind,
            })),
            mergedConfirmBtnBind: computed(() => ({
                styleType: 'secondary',
                size: 'lg',
                ...props.confirmBtnBind,
            })),
        });

        return {
            ...toRefs(state),
            ...setPagination(props, state, emit),
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-progress-wizard {
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
