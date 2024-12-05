<template>
    <p-pane-layout>
        <collector-detail-section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                                         :edit-mode="state.isEditMode"
                                         :hide-edit-button="!props.hasReadWriteAccess || !collectorDetailPageStore.getters.isEditableCollector"
                                         @click-edit="handleClickEdit"
        />

        <div v-if="!state.isEditMode"
             class="contents-wrapper"
        >
            <collector-detail-plugin-info :plugin="state.repositoryPlugin"
                                          :collector="collectorFormState.originCollector"
            />
            <plugin-summary-cards :collector="collectorFormState.originCollector"
                                  :recent-jobs="state.recentJobs"
                                  :history-link="collectorJobStore.hasJobs ? props.historyLink : undefined"
            />
            <collector-tags :tags="collectorFormState.originCollector?.tags" />
        </div>

        <div v-if="state.isEditMode"
             class="collector-base-info-edit"
        >
            <collector-detail-plugin-info :plugin="state.repositoryPlugin"
                                          :collector="collectorFormState.originCollector"
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

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';


import type { CollectorUpdateParameters } from '@/schema/inventory/collector/api-verbs/update';
import type { CollectorUpdatePluginParameters } from '@/schema/inventory/collector/api-verbs/update-plugin';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import type { JobModel } from '@/schema/inventory/job/model';
import { UPGRADE_MODE } from '@/schema/plugin/plugin/constant';
import type { PluginGetParameters } from '@/schema/repository/plugin/api-verbs/get';
import type { PluginModel } from '@/schema/repository/plugin/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorDetailPluginInfo from '@/services/asset-inventory/components/CollectorDetailPluginInfo.vue';
import PluginSummaryCards from '@/services/asset-inventory/components/CollectorDetailPluginSummaryCards.vue';
import CollectorDetailSectionHeader from '@/services/asset-inventory/components/CollectorDetailSectionHeader.vue';
import CollectorTags from '@/services/asset-inventory/components/CollectorDetailTags.vue';
import CollectorTagForm from '@/services/asset-inventory/components/CollectorFormTag.vue';
import CollectorVersionForm from '@/services/asset-inventory/components/CollectorFormVersion.vue';
import { useCollectorDetailPageStore } from '@/services/asset-inventory/stores/collector-detail-page-store';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';
import { useCollectorJobStore } from '@/services/asset-inventory/stores/collector-job-store';


const props = defineProps<{
    historyLink: Location
    hasReadWriteAccess?: boolean
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const collectorJobStore = useCollectorJobStore();
const collectorJobState = collectorJobStore.$state;

const collectorDetailPageStore = useCollectorDetailPageStore();

const state = reactive({
    collectorPluginInfo: computed<CollectorModel['plugin_info']|null>(() => collectorFormState.originCollector?.plugin_info ?? null),
    repositoryPlugin: null as null|PluginModel,
    isCollectorAutoUpgrade: computed<boolean>(() => collectorFormState.originCollector?.plugin_info?.upgrade_mode === UPGRADE_MODE.AUTO),
    isLatestVersion: computed<boolean>(() => {
        const version = state.collectorPluginInfo?.version;
        if (!version) return false;
        const latestVersion = collectorFormState.versions[0];
        if (latestVersion) return latestVersion === version;
        return false;
    }),
    recentJobs: computed<JobModel[]|null>(() => collectorJobState.recentJobs),
    isEditMode: false,
    isVersionValid: false,
    isTagsValid: false,
    isPluginUpdated: computed<boolean>(() => {
        if (!state.collectorPluginInfo) return false;
        return state.collectorPluginInfo.version !== collectorFormState.version
            || (state.collectorPluginInfo.upgrade_mode === UPGRADE_MODE.AUTO) !== collectorFormState.autoUpgrade;
    }),
    isTagsUpdated: computed<boolean>(() => {
        if (!collectorFormState.originCollector) return false;
        return JSON.stringify(collectorFormState.originCollector.tags) !== JSON.stringify(collectorFormState.tags);
    }),
    isAllValid: computed(() => (state.isPluginUpdated || state.isTagsUpdated) && state.isVersionValid && state.isTagsValid),
    updateLoading: false,
});


const fetchCollectorPluginUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdatePluginParameters = {
        collector_id: collectorFormState.collectorId,
        version: collectorFormState.version,
        upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
    };
    return SpaceConnector.clientV2.inventory.collector.updatePlugin<CollectorUpdatePluginParameters, CollectorModel>(params);
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        tags: collectorFormState.tags,
    };
    return SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>(params);
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
    collectorFormStore.resetForm();
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
        collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_COLLECTOR'), '');
    } catch (e) {
        collectorFormStore.resetVersion();
        collectorFormStore.resetAutoUpgrade();
        collectorFormStore.resetTags();
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_COLLECTOR'));
    } finally {
        state.updateLoading = false;
        state.isEditMode = false;
    }
};

watch(() => collectorFormState.pluginId, async (pluginId) => {
    if (pluginId) await collectorFormStore.getVersions(pluginId);
}, { immediate: true });

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
