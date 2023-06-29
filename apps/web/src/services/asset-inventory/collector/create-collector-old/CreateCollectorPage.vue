<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectDropdown, PLazyImg, PFieldGroup, PTextInput, PHeading, PToggleButton,
} from '@spaceone/design-system';
import { get, some } from 'lodash';
import {
    reactive, computed,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorProgressWizard from '@/services/asset-inventory/collector/create-collector-old/CollectorProgressWizard.vue';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/model';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const state = reactive({
    loading: true,
    plugin: {},
    imageUrl: computed(() => state.plugin?.tags?.icon),
    provider: computed(() => get(state.plugin, 'provider', '')),
    pluginId: route.params.pluginId || '',
    tags: {},
    supportedSchema: [],
    //
    collectorNames: [],
    versions: [],
});
const formState = reactive({
    inputModel: {
        name: '',
        version: '',
    },
    nameInvalidText: computed(() => {
        if (formState.inputModel.name.length < 2) {
            return t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_MIN');
        } if (state.collectorNames.includes(formState.inputModel.name)) {
            return t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
        }
        return '';
    }),
    isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
    versionInvalidText: computed(() => {
        if (formState.inputModel.version.length === 0) {
            return t('PLUGIN.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
        }
        return '';
    }),
    isVersionValid: computed(() => !(formState.inputModel.version.length === 0)),
    isConfValid: computed(() => formState.isNameValid && formState.isVersionValid),
    isTagsValid: true,
    isAutoUpgrade: true,
});
const tabState = reactive({
    tabs: computed(() => [
        {
            name: 'conf',
            label: t('PLUGIN.COLLECTOR.CREATE.TAB_SET_COLLECTOR'),
        },
        {
            name: 'tags',
            label: t('PLUGIN.COLLECTOR.CREATE.TAB_ADD_TAG'),
            optional: true,
        },
    ]),
    activeIdx: 0,
    loading: false,
    invalidState: computed(() => ({
        conf: !formState.isConfValid,
        tags: !formState.isTagsValid,
    })),
    disabled: computed(() => some(tabState.invalidState, (v) => v === true)),
});

/* api */
const getPlugin = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.client.repository.plugin.get({
            plugin_id: state.pluginId,
        });
        state.plugin = res;
        state.supportedSchema = res.capability.supported_schema;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_PLUGIN_TITLE'));
    } finally {
        state.loading = false;
    }
};
const getNames = async () => {
    const res = await SpaceConnector.client.inventory.collector.list({
        query: {
            only: ['name'],
        },
    });
    state.collectorNames = res.results.map((v) => v.name);
};
const getVersions = async () => {
    try {
        const res = await SpaceConnector.client.repository.plugin.getVersions({
            plugin_id: state.pluginId,
        });
        res.results.forEach((value, index) => {
            if (index === 0) {
                state.versions.push({ type: 'item', label: `${value} (latest)`, name: value });
            } else {
                state.versions.push({ type: 'item', label: value, name: value });
            }
        });
        formState.inputModel.version = res.results[0];
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
    }
};

/* event */
const onChangeAutoUpgrade = () => {
    formState.isAutoUpgrade = !formState.isAutoUpgrade;
};

const onClickCancel = () => {
    router.go(-1);
};
const onClickConfirm = async () => {
    if (!formState.isConfValid || !formState.isTagsValid) {
        return;
    }

    tabState.loading = true;
    const params = {
        name: formState.inputModel.name,
        priority: 10,
        tags: state.tags,
        plugin_info: {
            plugin_id: state.pluginId,
            provider: state.provider,
            upgrade_mode: UPGRADE_MODE.AUTO,
        },
    } as any;

    if (!formState.isAutoUpgrade) {
        params.plugin_info.upgrade_mode = UPGRADE_MODE.MANUAL;
        params.plugin_info.version = formState.inputModel.version;
    }

    try {
        await SpaceConnector.client.inventory.collector.create(params);
        showSuccessMessage(t('PLUGIN.COLLECTOR.CREATE.ALT_S_CREATE_TITLE'), '');
        await router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.CREATE.ALT_E_CREATE_TITLE'));
    } finally {
        tabState.loading = false;
    }
};
const handleUpdateTags = (tags: Tag) => {
    state.tags = tags;
};

const init = async () => {
    await getPlugin();
    await getNames();
    await getVersions();
};
init();

</script>

<template>
    <div class="collector-creator-page">
        <p-heading :title="t('PLUGIN.COLLECTOR.CREATE.TITLE')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <collector-progress-wizard v-model:active-idx="tabState.activeIdx"
                                   :tabs="tabState.tabs"
                                   :invalid-state="tabState.invalidState"
                                   :loading="tabState.loading"
                                   :disabled="tabState.disabled"
                                   @cancel="onClickCancel"
                                   @confirm="onClickConfirm"
        >
            <template #contents-conf>
                <div class="collector-input-wrapper">
                    <p-lazy-img class="flex-shrink-0 mr-8"
                                :src="state.imageUrl"
                                :loading="state.loading"
                                width="5.5rem"
                                height="5.5rem"
                    />
                    <div class="flex-grow">
                        <p-field-group :label="t('PLUGIN.COLLECTOR.CREATE.NAME_LABEL')"
                                       :invalid-text="formState.nameInvalidText"
                                       :invalid="!formState.isNameValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="formState.inputModel.name"
                                              class="block"
                                              :invalid="invalid"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="t('PLUGIN.COLLECTOR.CREATE.VERSION_LABEL')"
                                       :invalid="!formState.isVersionValid"
                                       :required="true"
                        >
                            <p-select-dropdown v-model="formState.inputModel.version"
                                               :items="state.versions"
                                               :disabled="formState.isAutoUpgrade"
                            />
                        </p-field-group>
                        <p-field-group :label="t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL')"
                                       :required="true"
                        >
                            <p-toggle-button :value="formState.isAutoUpgrade"
                                             @change-toggle="onChangeAutoUpgrade"
                            />
                        </p-field-group>
                    </div>
                </div>
            </template>
            <template #contents-tags>
                <tags-input-group v-model:is-valid="formState.isTagsValid"
                                  :tags="state.tags"
                                  show-validation
                                  @update-tags="handleUpdateTags"
                />
            </template>
        </collector-progress-wizard>
    </div>
</template>

<style lang="postcss" scoped>
.collector-creator-page {
    .collector-input-wrapper {
        @apply flex border-r border-gray-200;
        width: 50%;
        padding: 2.5rem;
        .p-text-input {
            width: 100%;
        }
    }

    /* custom design-system component - p-progress-wizard */
    :deep(.p-progress-wizard) {
        .contents {
            margin-top: 2.5rem;
        }
    }
}
</style>
