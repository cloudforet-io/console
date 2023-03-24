<template>
    <div v-if="!loading"
         class="project-alert-page"
    >
        <div v-if="!isActivated"
             class="activation-wrapper"
        >
            <strong>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_1') }}</strong>
            <p>{{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATION_DESC_2') }}</p>
            <p-button style-type="positive"
                      :disabled="!hasManagePermission"
                      @click="onActivateAlert"
            >
                {{ $t('PROJECT.DETAIL.PROJECT_ALERT_ACTIVATE') }}
            </p-button>
        </div>
        <p-button-tab v-else
                      :tabs="tabState.tabs"
                      :active-tab.sync="tabState.activeTab"
                      @change="onChangeTab"
        >
            <keep-alive><router-view /></keep-alive>
        </p-button-tab>
    </div>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, onActivated, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PButtonTab, PButton } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { PROJECT_ROUTE } from '@/services/project/route-config';

export default {
    name: 'ProjectAlertPage',
    components: {
        PButtonTab,
        PButton,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            isActivated: false,
            hasManagePermission: useManagePermissionState(),
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME, label: i18n.t('PROJECT.DETAIL.SUBTAB_ALERT') },
                { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME, label: i18n.t('PROJECT.DETAIL.TAB_MAINTENANCE_WINDOW') },
                { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME, label: i18n.t('PROJECT.DETAIL.SUBTAB_WEBHOOK') },
                { name: PROJECT_ROUTE.DETAIL.TAB.ALERT.SETTINGS._NAME, label: i18n.t('PROJECT.DETAIL.SUBTAB_SETTINGS') },
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
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ACTIVATE_ALERT'), '');
            } catch (e) {
                state.isActivated = false;
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_ACTIVATE_ALERT'));
            }
        };

        /* event */
        const onChangeTab = async (activeTab) => {
            if (activeTab === vm.$route.name) return;
            await vm.$router.replace({ name: activeTab });
        };

        /* init */
        onActivated(() => {
            if (vm.$route.name !== tabState.activeTab) {
                tabState.activeTab = vm.$route.name || PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME;
            }
        });

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
