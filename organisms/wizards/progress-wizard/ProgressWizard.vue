<template>
    <p-pane-layout class="p-progress-wizard">
        <header v-if="title" class="title">
            {{ title }}
        </header>
        <slot name="top">
            <slot name="progress">
                <p-progress-tab-bar :tabs="proxyTabs"
                                    :labels="labels"
                                    :active-idx.sync="proxyActiveIdx"
                                    @changeTab="onChangeTab"
                >
                    <template v-for="(tab) in tabs" :slot="`progress-${tab.key}`">
                        <slot :name="`progress-${tab.key}`" />
                    </template>
                    <template v-for="(tab) in tabs" :slot="`help-${tab.key}`">
                        <slot :name="`help-${tab.key}`" />
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
                    Step {{ activeIdx + 1 }}. {{ labels[activeTab.key] || activeTab.key }}
                    <span v-if="activeTab.optional" class="optional"> ({{ $t('COMMON.OPTIONAL') }})</span>
                </template>
                <template #extra>
                    <div class="step-appendix">
                        <slot :name="`step-append-${activeTab.key}`" :tab="activeTab" />
                    </div>
                </template>
            </p-panel-top>
            <div class="contents">
                <keep-alive>
                    <slot :name="`contents-${activeTab.key}`" :tab="activeTab" />
                </keep-alive>
            </div>
        </template>

        <slot name="bottom">
            <p-row>
                <p-col>
                    <p-button outline style-type="dark" size="lg"
                              class="txt-btn" @click="$emit('cancel', $event)"
                    >
                        {{ $t('BTN.CANCEL') }}
                    </p-button>
                </p-col>
                <p-col :flex-grow="0" class="nav-btn-box">
                    <p-button v-if="!isFirstTab"
                              outline style-type="secondary" size="lg"
                              @click="onClickPrev"
                    >
                        <p-i name="ic_back" color="transparent inherit" />{{ $t('COMMON.PREV') }}
                    </p-button>
                    <p-button v-if="!isLastTab"
                              outline style-type="secondary"
                              size="lg"
                              @click="onClickNext"
                    >
                        {{ $t('COMMON.NEXT') }}<p-i name="ic_back" color="transparent inherit" dir="down" />
                    </p-button>
                    <p-button style-type="secondary" size="lg"
                              :disabled="!showConfirm"
                              class="txt-btn"
                              @click="$emit('confirm', tabs, $event)"
                    >
                        {{ $t('BTN.CONFIRM') }}
                    </p-button>
                </p-col>
            </p-row>
        </slot>
    </p-pane-layout>
</template>

<script>
import {
    ref, toRefs, reactive, computed,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';


const setPagination = (props, state, emit) => {
    const isFirstTab = computed(() => state.proxyActiveIdx - 1 < 0);
    const isLastTab = computed(() => state.proxyActiveIdx + 1 >= state.proxyTabs.length);

    const changeStep = (idx) => {
        state.proxyTabs.splice(idx, 1, { ...state.proxyTabs[idx], showValidation: true });
        emit('changeStep', idx);
    };

    const onClickPrev = () => {
        if (isFirstTab.value) return;
        changeStep(state.proxyActiveIdx);
        state.proxyActiveIdx -= 1;
    };
    const onClickNext = () => {
        if (isLastTab.value) return;
        changeStep(state.proxyActiveIdx);
        state.proxyActiveIdx += 1;
    };

    const onChangeTab = (now, beforeIdx) => {
        changeStep(beforeIdx);
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
    events: ['update:tabs', 'cancel', 'confirm', 'changeStep'],
    components: {
        PPaneLayout,
        PProgressTabBar,
        PPanelTop,
        PI,
        PButton,
        PRow,
        PCol,
    },
    props: {
        tabs: Array,
        labels: {
            type: Object,
            default: () => ({}),
        },
        activeIdx: {
            type: Number,
            default: 0,
        },
        showConfirm: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyTabs: computed({
                get: () => props.tabs,
                set: (val) => {
                    emit('update:tabs', val);
                },
            }),
            proxyActiveIdx: makeProxy('activeIdx', props, emit),
        });

        const activeTab = computed(() => state.proxyTabs[state.proxyActiveIdx]);
        return {
            ...toRefs(state),
            activeTab,
            ...setPagination(props, state, emit),
        };
    },
};
</script>

<style lang="scss" scoped>
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
            color: $other1;
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
    .nav-btn-box {
        .btn {
            margin-left: 1.5rem;
        }
    }
}
</style>
