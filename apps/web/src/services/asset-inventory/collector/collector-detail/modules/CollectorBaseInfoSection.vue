<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button v-if="!state.isEditMode"
                          size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                          @click="handleClickEdit"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>

        <div v-if="!state.isEditMode"
             class="contents-wrapper"
        >
            <collector-plugin-info :plugin="state.repositoryPlugin"
                                   :collector="collectorFormState.originCollector"
            />
            <plugin-summary-cards :collector="collectorFormState.originCollector"
                                  :recent-jobs="state.recentJobs"
                                  :history-link="props.historyLink"
            />
            <collector-tags :tags="collectorFormState.originCollector?.tags" />
        </div>

        <div v-if="state.isEditMode"
             class="collector-base-info-edit"
        >
            <collector-plugin-info :plugin="state.repositoryPlugin"
                                   :collector="collectorFormState.originCollector"
                                   show-minimal
            />
            <collector-version-form @update:isVersionValid="handleUpdateIsVersionValid" />
            <collector-tag-form :service-name="$t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update:isTagsValid="handleUpdateIsTagsValid"
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

import {
    PHeading, PButton, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorJobStore } from '@/services/asset-inventory/collector/collector-detail/collector-job-store';
import CollectorPluginInfo from '@/services/asset-inventory/collector/collector-detail/modules/CollectorPluginInfo.vue';
import CollectorTags from '@/services/asset-inventory/collector/collector-detail/modules/CollectorTags.vue';
import PluginSummaryCards from '@/services/asset-inventory/collector/collector-detail/modules/PluginSummaryCards.vue';
import type {
    CollectorModel,
    CollectorPluginModel,
    JobModel,
    CollectorUpdateParameter,
    CollectorUpdatePluginParameter,
    RepositoryPluginModel,
} from '@/services/asset-inventory/collector/model';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorTagForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorTagForm.vue';
import CollectorVersionForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorVersionForm.vue';

const props = defineProps<{
    historyLink: Location
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const collectorJobStore = useCollectorJobStore();
const collectorJobState = collectorJobStore.$state;

const state = reactive({
    collectorPluginInfo: computed<CollectorPluginModel|null>(() => collectorFormState.originCollector?.plugin_info ?? null),
    repositoryPlugin: null as null|RepositoryPluginModel,
    isCollectorAutoUpgrade: computed<boolean>(() => collectorFormState.originCollector?.plugin_info?.upgrade_mode === UPGRADE_MODE.AUTO),
    isLatestVersion: computed<boolean>(() => {
        const version = state.collectorPluginInfo?.version;
        if (!version) return false;
        const latestVersion = collectorFormState.versions[0];
        if (latestVersion) return latestVersion === version;
        return false;
    }),
    recentJobs: computed<JobModel[]|undefined>(() => collectorJobState.recentJobs),
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
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdatePluginParameter = {
        collector_id: collectorFormStore.collectorId,
        version: collectorFormState.version,
        upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
    };
    return SpaceConnector.client.inventory.collector.updatePlugin(params);
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        tags: collectorFormState.tags,
    };
    return SpaceConnector.client.inventory.collector.update(params);
};
const getRepositoryPlugin = async (pluginId: string) => {
    try {
        state.repositoryPlugin = await SpaceConnector.client.repository.plugin.get({
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

watch(() => collectorFormStore.pluginId, async (pluginId) => {
    if (pluginId) await collectorFormStore.getVersions(pluginId);
}, { immediate: true });

watch(() => state.collectorPluginInfo, async (pluginInfo) => {
    if (pluginInfo?.plugin_id) await getRepositoryPlugin(pluginInfo.plugin_id);
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.contents-wrapper {
    padding: 0 1rem 2.5rem 1rem;
}
.collector-base-info-edit {
    padding: 0 1rem 1rem;
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
