<template>
    <p-pane-layout>
        <collector-detail-section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                                         :edit-mode="state.isEditMode"
                                         :hide-edit-button="!props.hasReadWriteAccess || !isEditable"
                                         @click-edit="handleClickEdit"
        />

        <div v-if="!state.isEditMode"
             class="contents-wrapper"
        >
            <collector-detail-plugin-info :plugin="state.repositoryPlugin"
                                          :collector="originCollectorData"
            />
            <plugin-summary-cards :collector="originCollectorData"
                                  :recent-jobs="recentJobsData?.results"
                                  :history-link="props.historyLink"
            />
            <collector-tags :tags="originCollectorData?.tags" />
        </div>

        <div v-if="state.isEditMode"
             class="collector-base-info-edit"
        >
            <collector-detail-plugin-info :plugin="state.repositoryPlugin"
                                          :collector="originCollectorData"
                                          show-minimal
            />
            <collector-version-form @update-valid="handleUpdateIsVersionValid" />
            <collector-tag-form :service-name="$t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update-valid="handleUpdateIsTagsValid"
            />
            <div class="button-group">
                <p-button style-type="tertiary"
                          size="lg"
                          :disabled="state.updateLoading"
                          @click="handleClickCancel"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          class="save-changes-button"
                          :disabled="!state.isAllValid"
                          :loading="state.updateLoading"
                          @click="handleClickSave"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import type { CollectorUpdatePluginParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update-plugin';
import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';
import { UPGRADE_MODE } from '@/api-clients/plugin/plugin/constant';
import type { PluginGetParameters } from '@/api-clients/repository/plugin/schema/api-verbs/get';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDetailPluginInfo from '@/services/asset-inventory/components/CollectorDetailPluginInfo.vue';
import PluginSummaryCards from '@/services/asset-inventory/components/CollectorDetailPluginSummaryCards.vue';
import CollectorDetailSectionHeader from '@/services/asset-inventory/components/CollectorDetailSectionHeader.vue';
import CollectorTags from '@/services/asset-inventory/components/CollectorDetailTags.vue';
import CollectorTagForm from '@/services/asset-inventory/components/CollectorFormTag.vue';
import CollectorVersionForm from '@/services/asset-inventory/components/CollectorFormVersion.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useInventoryJobListQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-query';
import { usePluginGetVersionsQuery } from '@/services/asset-inventory/composables/use-plugin-get-versions-query';
import { getIsEditableCollector } from '@/services/asset-inventory/helpers/collector-editable-value-helper';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';

const props = defineProps<{
    historyLink?: Location
    hasReadWriteAccess?: boolean
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const appContextStore = useAppContextStore();

const { collectorAPI } = useCollectorApi();

const state = reactive({
    collectorPluginInfo: computed<CollectorModel['plugin_info']|null>(() => originCollectorData.value?.plugin_info ?? null),
    repositoryPlugin: null as null|PluginModel,
    isCollectorAutoUpgrade: computed<boolean>(() => originCollectorData.value?.plugin_info?.upgrade_mode === UPGRADE_MODE.AUTO),
    isLatestVersion: computed<boolean>(() => {
        const version = state.collectorPluginInfo?.version;
        if (!version) return false;
        const latestVersion = pluginVersionsData.value?.[0];
        if (latestVersion) return latestVersion === version;
        return false;
    }),
    isEditMode: false,
    isVersionValid: false,
    isTagsValid: false,
    isPluginUpdated: computed<boolean>(() => {
        if (!state.collectorPluginInfo) return false;
        return state.collectorPluginInfo.version !== collectorFormState.version
            || (state.collectorPluginInfo.upgrade_mode === UPGRADE_MODE.AUTO) !== collectorFormState.autoUpgrade;
    }),
    isTagsUpdated: computed<boolean>(() => {
        if (!originCollectorData.value) return false;
        return JSON.stringify(originCollectorData.value.tags) !== JSON.stringify(collectorFormState.tags);
    }),
    isAllValid: computed(() => (state.isPluginUpdated || state.isTagsUpdated) && state.isVersionValid && state.isTagsValid),
    updateLoading: false,
});
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const collectorPluginId = computed<string|undefined>(() => originCollectorData.value?.plugin_info?.plugin_id ?? collectorFormState.repositoryPlugin?.plugin_id);
const isEditable = computed<boolean>(() => getIsEditableCollector(isAdminMode.value, originCollectorData.value));

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});
const fiveDaysAgo = dayjs.utc().subtract(5, 'day').toISOString();
const recentJobsQueryHelper = new ApiQueryHelper();
const { data: recentJobsData } = useInventoryJobListQuery({
    params: computed(() => {
        recentJobsQueryHelper.setFilters([
            { k: 'collector_id', v: collectorFormState.collectorId ?? '', o: '=' },
            { k: 'created_at', v: fiveDaysAgo, o: '>' },
        ]);
        return {
            query: recentJobsQueryHelper.data,
        };
    }),
});
const { data: pluginVersionsData } = usePluginGetVersionsQuery({
    pluginId: computed(() => collectorPluginId.value ?? ''),
});

const fetchCollectorPluginUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdatePluginParameters = {
        collector_id: collectorFormState.collectorId,
        version: collectorFormState.version,
        upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
    };
    return collectorAPI.updatePlugin(params);
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        tags: collectorFormState.tags,
    };
    return collectorAPI.update(params);
};
const getRepositoryPlugin = async (pluginId: string) => {
    try {
        state.repositoryPlugin = await SpaceConnector.clientV2.repository.plugin.get<PluginGetParameters, PluginModel>({
            plugin_id: pluginId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleUpdateIsVersionValid = (isValid: boolean) => {
    state.isVersionValid = isValid;
};
const handleUpdateIsTagsValid = (isValid: boolean) => {
    state.isTagsValid = isValid;
};

const handleClickCancel = () => {
    collectorFormStore.initForm(originCollectorData.value);
    state.isEditMode = false;
};
const handleClickSave = async () => {
    if (!state.isAllValid) return;
    try {
        state.updateLoading = true;
        let collector: CollectorModel|undefined;
        if (state.isPluginUpdated) {
            collector = await fetchCollectorPluginUpdate();
        }
        if (state.isTagsUpdated) {
            const result = await fetchCollectorUpdate();
            if (collector) collector = { ...collector, ...result };
            else collector = result;
        }
        if (!collector) throw new Error('collector is undefined'); // collector must be defined if all valid
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_COLLECTOR'), '');
    } catch (e) {
        collectorFormStore.initForm(originCollectorData.value);
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_COLLECTOR'));
    } finally {
        state.updateLoading = false;
        state.isEditMode = false;
    }
};

watch(() => state.collectorPluginInfo, async (pluginInfo) => {
    if (pluginInfo?.plugin_id) await getRepositoryPlugin(pluginInfo.plugin_id);
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.contents-wrapper {
    max-width: 65.5rem;
    padding: 1rem 1rem 2.5rem 1rem;
}
.collector-base-info-edit {
    padding: 1rem 1rem 1rem;
    .button-group {
        margin-bottom: 1.5rem;
        .save-changes-button {
            margin-left: 1rem;
        }
    }
}

@screen mobile {
    .contents-wrapper {
        .plugin-summary-card-wrapper {
            flex-direction: column;
        }
    }
}
</style>
