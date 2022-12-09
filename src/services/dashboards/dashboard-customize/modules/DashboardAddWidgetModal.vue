<template>
    <!--song-lang-->
    <p-button-modal :visible.sync="proxyVisible"
                    :header-title="$t('Add New Widget')"
                    size="lg"
                    class="dashboard-add-widget-modal"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
            >
                <template #default-widget>
                    <dashboard-default-widget-tab />
                </template>
            </p-tab>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PButtonModal, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/src/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardDefaultWidgetTab from '@/services/dashboards/dashboard-customize/modules/DashboardDefaultWidgetTab.vue';

interface Props {
    visible: boolean;
}
export default defineComponent<Props>({
    name: 'DashboardAddWidgetModal',
    components: {
        DashboardDefaultWidgetTab,
        PTab,
        PButtonModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
        });
        const tabState = reactive({
            tabs: computed<TabItem[]>(() => ([
                { name: 'default-widget', label: i18n.t('Default') }, // song-lang
                // { name: 'custom-widget', label: i18n.t('Custom') }, // song-lang
            ])),
            activeTab: 'default-widget',
        });

        return {
            ...toRefs(state),
            tabState,
        };
    },
});
</script>
<style lang="postcss" scoped>
.dashboard-add-widget-modal {
    .p-tab {
        @apply border-0;
    }
    &.p-button-modal {
        $modal-hedaer: 3.5rem;
        $modal-padding: 8rem;
        $modal-footer: 4rem;
        $tab-bar: 3rem;

        /* custom design-system component - p-button-modal */
        :deep(.modal-body) {
            @apply overflow-hidden;
            .tab-pane {
                height: calc(100vh - $modal-hedaer - $modal-padding - $modal-footer - $tab-bar);
            }
        }
    }
}
</style>
