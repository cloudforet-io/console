<template>
    <div class="alert-tab">
        <div v-if="!isActivated" class="activation-wrapper">
            <strong>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_1') }}</strong>
            <p>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_2') }}</p>
            <p-button
                style-type="safe"
                @click="onActivateAlert"
            >
                {{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATE') }}
            </p-button>
        </div>
        <p-button-tab
            v-else
            :tabs="tabState.tabs"
            :active-tab.sync="tabState.activeTab"
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
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';

import {
    PButton,
    PButtonTab,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import ProjectWebhookTab from '@/views/project/project/modules/ProjectWebhookTab.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'ProjectAlertTab',
    components: {
        PButton,
        PButtonTab,
        ProjectWebhookTab,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        isActivated: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { root }) {
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

        const onActivateAlert = async () => {
            try {
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ACTIVATE_ALERT'), '', root);
                console.log('project/alert/settings 로 이동!');
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ACTIVATE_ALERT'), e, root);
            }
        };

        return {
            tabState,
            onChangeTab,
            onActivateAlert,
        };
    },

};
</script>
<style lang="postcss" scoped>
.activation-wrapper {
    @apply text-center;
    margin-top: 2.5rem;
    strong {
        @apply font-bold;
        font-size: 1.125rem;
        line-height: 1.55;
    }
    p {
        margin: 0.5rem 0 1rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }
}
.alert-tab {
    .p-button-tab::v-deep .tab-pane {
        @apply pb-0;
    }
}

@screen mobile {
    .activation-wrapper {
        padding: 0 1rem;
    }
}
</style>
