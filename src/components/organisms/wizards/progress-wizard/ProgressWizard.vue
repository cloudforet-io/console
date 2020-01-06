<template>
    <p-pane-layout class="p-progress-wizard">
        <header v-if="title" class="title">
            {{ title }}
        </header>
        <slot name="top">
            <slot name="progress">
                <p-progress-tab-bar :tabs.sync="proxyTabs"
                                    :active-idx.sync="proxyActiveIdx"
                                    :show-validation="showValidation"
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
                <aside v-if="activeTab.warning" class="caution">
                    <p-i name="ic_alert" height="1rem" width="1rem"
                         :color="warningColor"
                    />
                    {{ activeTab.warning }}
                </aside>
            </template>
        </slot>
        <template v-if="activeTab">
            <slot :name="`body-${activeTab.key}`" :tab="activeTab.key">
                <slot :name="`step-${activeTab.key}`" :tab="activeTab.key">
                    <p-panel-top class="step-title">
                        Step {{ activeIdx + 1 }}. {{ activeTab.label }}
                        <span v-if="activeTab.optional" class="optional"> (optional)</span>
                        <template #head>
                            <div class="step-appendix">
                                <slot :name="`step-append-${activeTab.key}`" :tab="activeTab.key" />
                            </div>
                        </template>
                    </p-panel-top>
                </slot>
                <div class="contents">
                    <slot :name="`contents-${activeTab.key}`" :tab="activeTab.key" />
                </div>
            </slot>
        </template>

        <slot name="bottom">
            <p-row>
                <p-col>
                    <p-button outline style-type="dark" size="lg"
                              class="txt-btn" @click="$emit('cancel', $event)"
                    >
                        Cancel
                    </p-button>
                </p-col>
                <p-col :flex-grow="0">
                    <p-button v-if="!isFirstTab"
                              outline style-type="secondary" size="lg"
                              @mouseenter="onNavBtnHover('prev', true)"
                              @mouseleave="onNavBtnHover('prev', false)"
                              @click="onClickPrev"
                    >
                        <p-i name="ic_back" :color="`transparent ${btnColor.prev}`" />Prev
                    </p-button>
                    <p-button v-if="!isLastTab" outline style-type="secondary"
                              size="lg"
                              @mouseenter="onNavBtnHover('next', true)"
                              @mouseleave="onNavBtnHover('next', false)"
                              @click="onClickNext"
                    >
                        Next<p-i name="ic_back" :color="`transparent ${btnColor.next}`" dir="down" />
                    </p-button>
                    <p-button v-if="showConfirm" style-type="secondary" size="lg"
                              class="txt-btn"
                              @click="$emit('confirm', tabs, $event)"
                    >
                        Confirm
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

import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout';
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import PI from '@/components/atoms/icons/PI';
import PButton from '@/components/atoms/buttons/Button';
import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';
import { secondary, white, other1 } from '@/styles/_variables.scss';

const setStyles = () => {
    const warningColor = ref(other1);
    const btnColor = ref({
        prev: secondary,
        next: secondary,
    });
    const onNavBtnHover = (type, isHovered) => {
        btnColor.value[type] = isHovered ? white : secondary;
    };

    return {
        warningColor,
        btnColor,
        onNavBtnHover,
    };
};

const setPagination = (state) => {
    const isFirstTab = computed(() => state.proxyActiveIdx - 1 < 0);
    const isLastTab = computed(() => state.proxyActiveIdx + 1 >= state.proxyTabs.length);
    const onClickPrev = () => {
        if (isFirstTab.value) return;
        state.proxyActiveIdx -= 1;
    };
    const onClickNext = () => {
        if (isLastTab.value) return;
        state.proxyActiveIdx += 1;
    };

    return {
        isFirstTab,
        isLastTab,
        onClickPrev,
        onClickNext,
    };
};

export default {
    name: 'PProgressWizard',
    events: ['update:tabs', 'cancel', 'confirm'],
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
        activeIdx: {
            type: Number,
            default: 0,
        },
        showValidation: {
            type: Boolean,
            default: false,
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
            proxyTabs: makeProxy('tabs', props, emit),
            proxyActiveIdx: makeProxy('activeIdx', props, emit),
        });

        const activeTab = computed(() => state.proxyTabs[state.proxyActiveIdx]);

        return {
            ...toRefs(state),
            activeTab,
            ...setStyles(),
            ...setPagination(state),
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
        padding: 2.375rem 0 0 0;
        font-size: 1.125rem;
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
}
</style>
