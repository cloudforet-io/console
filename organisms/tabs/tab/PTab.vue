<template>
    <div class="p-tab">
        <p-tab-bar class="p-tab-bar" :class="{'is-single':isSingle}" :active-tab.sync="proxyActiveTab"
                   :tabs="tabs"
        />
        <div class="tab-pane">
            <keep-alive>
                <slot v-for="tab in keepTabs"
                      :name="proxyActiveTab === tab.name ? proxyActiveTab : undefined"
                      :tabName="tab.name" :label="tab.label"
                />
            </keep-alive>
            <template v-for="tab in nonKeepTabs">
                <div v-if="proxyActiveTab === tab.name" :key="tab.name">
                    <slot :name="tab.name" :tabName="tab.name"
                          :label="tab.label"
                    />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import PTabBar from '@/components/molecules/tabs/tab-bar/PTabBar.vue';
import { TabProps, TabItem } from '@/components/organisms/tabs/tab/type';

import { makeProxy } from '@/components/util/composition-helpers';

export default {
    name: 'PTab',
    components: { PTabBar },
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
    },
    setup(props: TabProps, { emit }) {
        const state = reactive({
            proxyActiveTab: makeProxy('activeTab', props, emit),
            isSingle: computed(() => props.tabs.length === 1),
            nonKeepTabs: computed(() => props.tabs.reduce<TabItem[]>((results, current, idx) => {
                if (typeof current === 'string') results.push({ name: current, label: current, keepAlive: false });
                else if (!current.keepAlive) results.push(current);
                return results;
            }, [])),
            keepTabs: computed(() => props.tabs.filter(tab => (typeof tab === 'string' ? false : tab.keepAlive))),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
.p-tab {
    @apply rounded-sm border  border-gray-200 bg-white;
    .p-tab-bar {
        @apply border-b-4 border-gray-100;
        &.is-single {
            @apply border-b-2;
        }
    }
    .tab-pane {
        @apply w-full pb-8;
    }
}
</style>
