<template>
    <div class="p-button-tab">
        <transition name="fade" mode="out-in">
            <p-select-btn-group class="px-4" :buttons="buttons" :selected.sync="proxyActiveTab" />
        </transition>
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
    computed,
} from '@vue/composition-api';
import {
    isOne, TabItem,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
import { ButtonTabProps } from '@/components/organisms/tabs/button-tab/type';
import { makeProxy } from '@/components/util/composition-helpers';

export default {
    name: 'PButtonTab',
    components: { PSelectBtnGroup },
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
        },
        keepAliveAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ButtonTabProps, { emit }) {
        return {
            proxyActiveTab: makeProxy('activeTab', props, emit),
            isOne: isOne(props),
            nonKeepTabs: computed(() => props.tabs.reduce<TabItem[]>((results, current, idx) => {
                if (props.keepAliveAll) return [];
                if (typeof current === 'string') results.push({ name: current, label: current, keepAlive: false });
                else if (!current.keepAlive) results.push(current);
                return results;
            }, [])),
            keepTabs: computed(() => {
                if (props.keepAliveAll) {
                    return props.tabs.map((d) => {
                        if (typeof d === 'string') return { name: d, label: d };
                        return d;
                    });
                }
                return props.tabs.filter(tab => (typeof tab === 'string' ? false : tab.keepAlive));
            }),
            buttons: computed(() => props.tabs.map((d: string|TabItem) => {
                if (typeof d === 'string') {
                    return { name: d, label: d };
                }
                return { name: d.name, label: d.label };
            })),
        };
    },
};
</script>

<style lang="postcss">
    .p-button-tab {
        @apply mt-8;
        .tab-pane {
            @apply w-full pb-8;
        }
        .fade-enter-active, .fade-leave-active {
            transition: opacity 0.2s;
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
    }
</style>
