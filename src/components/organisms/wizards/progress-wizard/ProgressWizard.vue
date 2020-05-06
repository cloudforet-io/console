<template>
    <p-pane-layout class="p-progress-wizard">
        <header v-if="title" class="title">
            {{ title }}
        </header>
        <slot name="top">
            <slot name="progress">
                <p-progress-tab-bar :tabs="tabs"
                                    :active-idx.sync="proxyActiveIdx"
                                    :invalid-state="invalidState"
                                    :progress-state="progressState"
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
            <p-panel-top class="step-title">
                <template>
                    Step {{ proxyActiveIdx + 1 }}. {{ activeTab.label || activeTab.name }}
                    <span v-if="activeTab.optional" class="optional"> ({{ $t('COMMON.OPTIONAL') }})</span>
                </template>
                <template #extra>
                    <div class="step-appendix">
                        <slot :name="`step-append-${activeTab.name}`" :tab="activeTab" />
                    </div>
                </template>
            </p-panel-top>
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
                    <p-button v-bind="mergedConfirmBtnBind"
                              class="txt-btn"
                              @click="$emit('confirm', tabs, $event)"
                    >
                        {{ $t('BTN.CONFIRM') }}
                    </p-button>
                </div>
            </div>
        </slot>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    ref, toRefs, reactive, computed,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import {
    ProgressWizardProps,
    progressWizardProps,
} from '@/components/organisms/wizards/progress-wizard/ProgressWizard.toolset';


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
        PPaneLayout,
        PProgressTabBar,
        PPanelTop,
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
    .title {
        font-size: 1.5rem;
        padding-bottom: 1rem;
    }
    .step-title {
        margin-top: 2.375rem;
        .optional {
            font-style: italic;
        }
    }
    .caution {
        display: flex;
        align-items: center;
        font-size: .875rem;
        padding-top: 1rem;
        .p-i-icon {
            margin-right: .5rem;
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
    .step-appendix {
        display: flex;
        flex-grow: 1;
        justify-content: flex-end;
    }
    .bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .nav-btn-box {
            display: inline-flex;
            align-items: center;
            .btn {
                margin-left: 1.5rem;
            }
        }
    }
}
</style>
