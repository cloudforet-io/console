<template>
    <div class="p-button-tab">
        <transition name="fade" mode="out-in">
            <p-select-btn-group class="px-4" :buttons="buttons" :selected.sync="proxyActiveTab"
                                @clickButton="onChange"
            />
        </transition>
        <div class="tab-pane">
            <keep-alive>
                <slot v-for="tab in keepTabs"
                      :name="proxyActiveTab === tab.name ? proxyActiveTab : undefined"
                      :tabName="tab.name" :label="tab.label"
                />
            </keep-alive>
            <template v-for="tab in nonKeepTabs">
                <slot v-if="proxyActiveTab === tab.name" :name="tab.name" :tabName="tab.name"
                      :label="tab.label"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';

import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
import { TabItem } from '@/components/organisms/tabs/tab/type';
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
            default: '',
        },
        keepAliveAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ButtonTabProps, { emit }) {
        return {
            proxyActiveTab: makeProxy('activeTab', props, emit),
            isOne: computed(() => props.tabs.length === 1),
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
            onChange(...args) {
                emit('change', ...args);
            },
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
