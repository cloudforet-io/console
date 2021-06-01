<template>
    <div class="alert-tab">
        <p-button-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
                      keep-alive-all
                      @change="onChangeTab"
        >
            <template #alert>
                <div>Project Alert</div>
            </template>
            <template #webhook>
                <project-webhook-tab :project-id="projectId" />
            </template>
            <template #settings>
                <div>Project Settings</div>
            </template>
        </p-button-tab>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PButtonTab,
} from '@spaceone/design-system';

import ProjectWebhookTab from '@/views/project/project/modules/ProjectWebhookTab.vue';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

export default {
    name: 'ProjectAlertTab',
    components: {
        PButtonTab,
        ProjectWebhookTab,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'alert', label: vm.$t('PROJECT.DETAIL.SUBTAB_ALERT'), keepAlive: true },
                { name: 'webhook', label: vm.$t('PROJECT.DETAIL.SUBTAB_WEBHOOK'), keepAlive: true },
                { name: 'settings', label: vm.$t('PROJECT.DETAIL.SUBTAB_SETTINGS'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'webhook',
        });

        const onChangeTab = async (tab) => {
            tabState.activeTab = tab;
        };

        return {
            tabState,
            onChangeTab,
        };
    },

};
</script>
<style lang="postcss" scoped>
.alert-tab {
    .p-button-tab::v-deep .tab-pane {
        @apply pb-0;
    }
}
</style>
