<template>
    <div class="p-tab">
        <p-tab-bar class="p-tab-bar" :class="{'is-one':isOne}" :active-tab.sync="proxyActiveTab"
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
import PTabBar from '@/components/molecules/tabs/tab-bar/PTabBar.vue';
import { makeProxy } from '@/lib/compostion-util';
import {
    computed, defineComponent,
} from '@vue/composition-api';
import {
    isOne, tabBarProps, TabBarProps, TabItem,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';

export default defineComponent({
    name: 'PTab',
    components: { PTabBar },
    mixins: [tabBarProps],
    setup(props: TabBarProps) {
        return {
            proxyActiveTab: makeProxy('activeTab'),
            isOne: isOne(props),
            nonKeepTabs: computed(() => props.tabs.reduce<TabItem[]>((results, current, idx) => {
                if (typeof current === 'string') results.push({ name: current, label: current, keepAlive: false });
                else if (!current.keepAlive) results.push(current);
                return results;
            }, [])),
            keepTabs: computed(() => props.tabs.filter(tab => (typeof tab === 'string' ? false : tab.keepAlive))),
        };
    },
});
</script>

<style lang="postcss" scoped>
    .p-tab {
        @apply rounded-sm border  border-gray-200 bg-white;
    }
    .p-tab-bar {
        @apply border-b-4 border-gray-100;
        &.is-one {
            @apply border-b-2;
        }
    }
    .tab-pane {
        @apply w-full pb-8;
    }

</style>
