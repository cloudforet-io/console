<template>
    <div class="p-tab">
        <p-tab-bar class="p-tab-bar" :class="{'is-one':isOne}" :active-tab.sync="proxyActiveTab"
                   :tabs="tabs"
        />
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

<script lang="ts">
import PTabBar from '@/components/molecules/tabs/tab-bar/PTabBar.vue';
import { makeProxy } from '@/lib/compostion-util';
import { computed, defineComponent } from '@vue/composition-api';
import { tabBarProps, isActive, tabData } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';


export default defineComponent({
    name: 'PTab',
    components: { PTabBar },
    mixins: [tabBarProps],
    setup(props: any, { emit }) {
        return {
            proxyActiveTab: makeProxy('activeTab'),
            tabData: tabData(props),
            isActive: isActive(props),
            isOne: computed(() => props.tabs.length === 1),
        };
    },
});
</script>

<style lang="postcss" scoped>
    .p-tab{
        @apply rounded-sm border  border-gray-200 bg-white;
        .p-tab-bar{
            @apply border-b-4 border-gray-100;
            &.is-one{
                @apply border-b-2;
            }
        }
        .tab-pane{
            @apply w-full;
        }
    }

</style>
