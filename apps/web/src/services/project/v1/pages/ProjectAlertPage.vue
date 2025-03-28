<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonTab, PButton } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectAlertConfigCreateParameters } from '@/schema/monitoring/project-alert-config/api-verbs/create';
import type { ProjectAlertConfigListParameters } from '@/schema/monitoring/project-alert-config/api-verbs/list';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectAlert from '@/services/project/v1/components/ProjectAlertListTab.vue';
import ProjectSettings from '@/services/project/v1/components/ProjectAlertSettingsTab.vue';
import ProjectWebhook from '@/services/project/v1/components/ProjectAlertWebhookTab.vue';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const state = reactive({
    loading: true,
    isActivated: false,
});
const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'alert', label: i18n.t('PROJECT.DETAIL.SUBTAB_ALERT') },
        { name: 'webhook', label: i18n.t('PROJECT.DETAIL.SUBTAB_WEBHOOK') },
        { name: 'settings', label: i18n.t('PROJECT.DETAIL.SUBTAB_SETTINGS') },
    ])),
    activeTab: 'alert',
});

/* api */
const getProjectAlertConfig = async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.clientV2.monitoring.projectAlertConfig.list<ProjectAlertConfigListParameters, ListResponse<ProjectAlertConfigModel>>({
            project_id: props.id,
        });
        state.isActivated = !!results?.length;
    } catch (e) {
        state.isActivated = false;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleActivateAlert = async () => {
    try {
        if (!props.id) throw new Error('Project ID is required');
        await SpaceConnector.clientV2.monitoring.projectAlertConfig.create<ProjectAlertConfigCreateParameters, ProjectAlertConfigModel>({
            project_id: props.id,
        });
        state.isActivated = true;
        tabState.activeTab = 'settings';
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ACTIVATE_ALERT'), '');
    } catch (e) {
        state.isActivated = false;
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_ACTIVATE_ALERT'));
    }
};

/* event */
const handleChangeTab = async (activeTab: string) => {
    if (activeTab === route.query?.tab) return;
    await router.replace({
        query: { tab: activeTab },
    }).catch(() => {});
};

/* init */
watch(() => props.id, (projectId) => {
    if (projectId) getProjectAlertConfig();
    if (route.query?.tab !== tabState.activeTab) {
        tabState.activeTab = route.query?.tab as string || 'alert';
    }
}, { immediate: true });
</script>

<template>
    <div v-if="!state.loading"
         class="project-alert-page"
    >
        <div v-if="!state.isActivated"
             class="activation-wrapper"
        >
            <strong>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_1') }}</strong>
            <p>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_2') }}</p>
            <p-button style-type="positive"
                      @click="handleActivateAlert"
            >
                {{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATE') }}
            </p-button>
        </div>
        <p-button-tab v-else
                      :tabs="tabState.tabs"
                      :active-tab.sync="tabState.activeTab"
                      @change="handleChangeTab"
        >
            <template #alert>
                <project-alert :id="id" />
            </template>
            <template #webhook>
                <project-webhook :id="id" />
            </template>
            <template #settings>
                <project-settings :id="id" />
            </template>
        </p-button-tab>
    </div>
</template>

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
    /* custom design-system component - p-button-tab */
    :deep(.p-button-tab) {
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
