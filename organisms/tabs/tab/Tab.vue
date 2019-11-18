<template>
    <div class="tab">
        <p-tab-bar :active-tab.sync="proxyActiveTab" :tabs="tabs" />
        <div class="tab-content">
            <template v-for="tab in tabData">
                <div
                    :key="tab.name"
                    class="tab-pane fade"
                    :class="{show:isActive(tab.name),active:isActive(tab.name)}"
                    role="tabpanel"
                >
                    <slot :name="tab.name" :tabName="tab.name" :label="tab.label" />
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import PTabBar, { tabBarProps, isActive, tabData } from '@/components/molecules/tabs/tab-bar/TabBar';
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

<style lang="scss" scoped>
    .tab-pane{
        background-color: $white;
        width: 100%;
        padding: 1rem;
        border: 1px solid $gray3;
        border-radius: 0px 2px 2px 2px;
        box-shadow: 0px 0px 8px #4D49B614;
    }
</style>
