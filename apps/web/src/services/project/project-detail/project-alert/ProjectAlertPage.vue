<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonTab, PButton } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import {
    computed, onActivated, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { PROJECT_ROUTE } from '@/services/project/route-config';

interface Props {
    id: string;
}

const props = defineProps<Props>();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const state = reactive({
    loading: true,
    isActivated: false,
    hasManagePermission: useManagePermissionState(),
});
const tabState = reactive({
    tabs: computed(() => ([
        { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME, label: t('PROJECT.DETAIL.SUBTAB_ALERT') },
        { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME, label: t('PROJECT.DETAIL.TAB_MAINTENANCE_WINDOW') },
        { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME, label: t('PROJECT.DETAIL.SUBTAB_WEBHOOK') },
        { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.SETTINGS._NAME, label: t('PROJECT.DETAIL.SUBTAB_SETTINGS') },
    ] as TabItem[])),
    activeTab: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME,
});

/* api */
const getProjectAlertConfig = async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.monitoring.projectAlertConfig.list({
            project_id: props.id,
        });
        state.isActivated = !!results.length;
    } catch (e) {
        state.isActivated = false;
        ErrorHandler.handleError(e);
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
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_ACTIVATE_ALERT'), '');
    } catch (e) {
        state.isActivated = false;
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_ACTIVATE_ALERT'));
    }
};

/* event */
const onChangeTab = async (activeTab) => {
    if (activeTab === route.name) return;
    await router.replace({ name: activeTab });
};

/* init */
onActivated(() => {
    if (route.name !== tabState.activeTab) {
        tabState.activeTab = (route.name || PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME) as string;
    }
});

watch(() => props.id, (projectId) => {
    if (projectId) getProjectAlertConfig();
}, { immediate: true });

</script>

<template>
    <div v-if="!state.loading"
         class="project-alert-page"
    >
        <div v-if="!state.isActivated"
             class="activation-wrapper"
        >
            <strong>{{ t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_1') }}</strong>
            <p>{{ t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_2') }}</p>
            <p-button style-type="positive"
                      :disabled="!state.hasManagePermission"
                      @click="onActivateAlert"
            >
                {{ t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATE') }}
            </p-button>
        </div>
        <p-button-tab v-else
                      v-model:active-tab="tabState.activeTab"
                      :tabs="tabState.tabs"
                      @change="onChangeTab"
        >
            <keep-alive><router-view /></keep-alive>
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
