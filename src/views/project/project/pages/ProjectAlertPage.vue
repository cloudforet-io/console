<template>
    <div v-if="!loading" class="project-alert-page">
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
                <project-webhook :project-id="id" />
            </template>
            <template #settings>
                <project-settings :project-id="id" />
            </template>
        </p-button-tab>
    </div>
</template>

<script lang="ts">
import { isEmpty } from 'lodash';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButtonTab, PButton } from '@spaceone/design-system';
import ProjectWebhook from '@/views/project/project/modules/ProjectWebhook.vue';
import ProjectSettings from '@/views/project/project/modules/project-alert/ProjectSettings.vue';

import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';


export default {
    name: 'ProjectAlertPage',
    components: {
        ProjectSettings,
        ProjectWebhook,
        PButtonTab,
        PButton,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            isActivated: false,
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'alert', label: vm.$t('PROJECT.DETAIL.SUBTAB_ALERT'), keepAlive: true },
                { name: 'webhook', label: vm.$t('PROJECT.DETAIL.SUBTAB_WEBHOOK'), keepAlive: true },
                { name: 'settings', label: vm.$t('PROJECT.DETAIL.SUBTAB_SETTINGS'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'alert',
        });

        /* api */
        const getProjectAlertConfig = async () => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.monitoring.projectAlertConfig.get({
                    project_id: props.id,
                });
                if (!isEmpty(res)) state.isActivated = true;
            } catch (e) {
                state.isActivated = false;
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const onActivateAlert = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.create({
                    project_id: props.id,
                });
                state.isActivated = true;
                tabState.activeTab = 'settings';
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ACTIVATE_ALERT'), '', root);
            } catch (e) {
                state.isActivated = false;
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ACTIVATE_ALERT'), e, root);
            }
        };

        /* event */
        const onChangeTab = async (tab) => {
            tabState.activeTab = tab;
        };

        watch(() => props.id, (projectId) => {
            if (projectId) getProjectAlertConfig();
        }, { immediate: true });

        return {
            ...toRefs(state),
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
.project-alert-page {
    .p-button-tab::v-deep {
        .button-group {
            @apply mb-0;
            margin-top: 2rem;
        }
        .tab-pane {
            @apply pb-0;
        }
    }
}

@screen mobile {
    .activation-wrapper {
        padding: 0 1rem;
    }
}
</style>
