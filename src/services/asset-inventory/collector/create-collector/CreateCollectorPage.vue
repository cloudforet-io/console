<template>
    <div class="collector-creator-page">
        <p-heading :title="$t('PLUGIN.COLLECTOR.CREATE.TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <p-progress-wizard :tabs="tabState.tabs"
                           :active-idx.sync="tabState.activeIdx"
                           :invalid-state="tabState.invalidState"
                           :loading="tabState.loading"
                           :disabled="tabState.disabled"
                           @cancel="onClickCancel"
                           @confirm="onClickConfirm"
        >
            <template #contents-conf>
                <div class="collector-input-wrapper">
                    <p-lazy-img class="flex-shrink-0 mr-8"
                                :src="imageUrl"
                                :loading="loading"
                                width="5.5rem"
                                height="5.5rem"
                    />
                    <div class="flex-grow">
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.NAME_LABEL')"
                                       :invalid-text="nameInvalidText"
                                       :invalid="!isNameValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="inputModel.name"
                                              class="block"
                                              :invalid="invalid"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.VERSION_LABEL')"
                                       :invalid="!isVersionValid"
                                       :required="true"
                        >
                            <p-select-dropdown v-model="inputModel.version"
                                               :items="versions"
                                               :disabled="isAutoUpgrade"
                            />
                        </p-field-group>
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL')"
                                       :required="true"
                        >
                            <p-toggle-button :value="isAutoUpgrade"
                                             @change="onChangeAutoUpgrade"
                            />
                        </p-field-group>
                    </div>
                </div>
            </template>
            <template #contents-tags>
                <tags-input-group :tags="tags"
                                  show-validation
                                  :is-valid.sync="isTagsValid"
                                  @update-tags="handleUpdateTags"
                />
            </template>
        </p-progress-wizard>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PProgressWizard, PSelectDropdown, PLazyImg, PFieldGroup, PTextInput, PHeading, PToggleButton,
} from '@spaceone/design-system';
import { get, some } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { UPGRADE_MODE } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

export default {
    name: 'CreateCollectorPage',
    components: {
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PProgressWizard,
        TagsInputGroup,
        PHeading,
        PLazyImg,
        PToggleButton,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            plugin: {},
            imageUrl: computed(() => state.plugin?.tags?.icon),
            provider: computed(() => get(state.plugin, 'provider', '')),
            pluginId: get(vm, '$route.params.pluginId', ''),
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
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_MIN');
                } if (state.collectorNames.includes(formState.inputModel.name)) {
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
                }
                return '';
            }),
            isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
            versionInvalidText: computed(() => {
                if (formState.inputModel.version.length === 0) {
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
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
                    label: vm.$t('PLUGIN.COLLECTOR.CREATE.TAB_SET_COLLECTOR'),
                },
                {
                    name: 'tags',
                    label: vm.$t('PLUGIN.COLLECTOR.CREATE.TAB_ADD_TAG'),
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
                ErrorHandler.handleRequestError(e, vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_PLUGIN_TITLE'));
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
                state.versions = [];
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
                ErrorHandler.handleRequestError(e, vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
            }
        };

        /* event */
        const onChangeAutoUpgrade = () => {
            formState.isAutoUpgrade = !formState.isAutoUpgrade;
        };

        const onClickCancel = () => {
            vm.$router.go(-1);
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
                showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.CREATE.ALT_S_CREATE_TITLE'), '');
                await vm.$router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_CREATE_TITLE'));
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

        return {
            ...toRefs(state),
            ...toRefs(formState),
            tabState,
            onClickCancel,
            onClickConfirm,
            onChangeAutoUpgrade,
            handleUpdateTags,
        };
    },
};
</script>

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
