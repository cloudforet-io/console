<template>
    <div class="tab">
        <p-tab-bar :active-tab.sync="proxyActiveTab" :tabs="tabs" />
        <div class="tab-content">
            <template v-for="tab in tabData">
                <div v-if="tab.keepAlive || tab.name === proxyActiveTab"
                     v-show="tab.name === proxyActiveTab"
                     :key="tab.name"
                     class="tab-pane opacity-0"
                     :class="{'opacity-100 block':isActive(tab.name),
                              active:isActive(tab.name)}"
                     role="tabpanel"
                >
                    <slot :name="tab.name" :tabName="tab.name" :label="tab.label" />
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import PTabBar, { tabBarProps, isActive, tabData } from '@/components/molecules/tabs/tab-bar/TabBar.vue';
import { makeProxy } from '@/lib/compostion-util';


export default {
    name: 'PTab',
    components: { PTabBar },
    mixins: [tabBarProps],
    setup(props, { emit }) {
        return {
            proxyActiveTab: makeProxy('activeTab', props, emit),
            tabData: tabData(props),
            isActive: isActive(props),
        };
    },
};
</script>

<style lang="postcss" scoped>
    .tab-pane{
        @apply bg-white border border-gray3;
        width: 100%;
        padding: 1rem 1rem 2.5rem;
        border-radius: 0px 2px 2px 2px;
        box-shadow: 0px 0px 8px #4D49B614;
    }
</style>
