<template>
    <general-page-layout class="collector-creator-container">
        <div class="page-navigation">
            <p-breadcrumbs :routes="routes" />
        </div>
        <p-page-title :title="$t('PLUGIN.COLLECTOR.CREATE.TITLE')" child @goBack="onClickBackButton" />
        <p-progress-wizard :tabs="tabState.tabs"
                           :active-idx.sync="tabState.activeIdx"
                           :invalid-state="tabState.invalidState"
                           :loading="tabState.loading"
                           :disabled="tabState.disabled"
                           @cancel="onClickCancel"
                           @confirm="onClickConfirm"
        >
            <template #contents-conf="{tab}">
                <div class="collector-input-wrapper">
                    <p-lazy-img class="flex-shrink-0 mr-8"
                                :src="imageUrl"
                                :loading="loading"
                                width="5.5rem" height="5.5rem"
                    />
                    <div class="flex-grow">
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.NAME_LABEL')"
                                       :invalid-text="nameInvalidText"
                                       :invalid="!isNameValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="inputModel.name" class="block" :invalid="invalid" />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.PRIORITY_LABEL')"
                                       :invalid-text="priorityInvalidText"
                                       :invalid="!isPriorityValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="inputModel.priority" type="number" class="block"
                                              :invalid="invalid"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.VERSION_LABEL')"
                                       :invalid="!isVersionValid"
                                       :required="true"
                        >
                            <p-select-dropdown v-model="inputModel.version" :items="versions" :disabled="isAutoUpgrade" />
                        </p-field-group>
                        <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL')" :required="true">
                            <p-toggle-button :value="isAutoUpgrade" @change="onChangeAutoUpgrade" />
                        </p-field-group>
                    </div>
                </div>
            </template>
            <template #contents-credentials>
                <confirm-credentials :provider="provider" :supported-schema="supportedSchema" class="mt-8" />
            </template>
            <template #contents-tags>
                <tags-input-group :tags.sync="tags"
                                  :show-validation="true"
                                  :is-valid.sync="isTagsValid"
                />
            </template>
        </p-progress-wizard>
    </general-page-layout>
</template>

<script lang="ts">
import { get, some } from 'lodash';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PProgressWizard, PSelectDropdown, PLazyImg, PBreadcrumbs, PFieldGroup, PTextInput, PPageTitle, PToggleButton,
} from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';

import ConfirmCredentials from '@/services/plugin/collector/create-collector/modules/ConfirmCredentials.vue';
import { UPGRADE_MODE } from '@/services/plugin/collector/type';
import { PLUGIN_ROUTE } from '@/services/plugin/routes';


export default {
    name: 'CreateCollectorPage',
    components: {
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        GeneralPageLayout,
        ConfirmCredentials,
        PProgressWizard,
        TagsInputGroup,
        PPageTitle,
        PBreadcrumbs,
        PLazyImg,
        PToggleButton,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            plugin: {},
            imageUrl: computed(() => state.plugin?.tags?.icon),
            provider: computed(() => get(state.plugin, 'provider', '')),
            pluginId: get(root, '$route.params.pluginId', ''),
            tags: {},
            supportedSchema: [],
            //
            collectorNames: [],
            versions: [],
        });
        const formState = reactive({
            inputModel: {
                name: '',
                priority: 10,
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
            priorityInvalidText: computed(() => {
                if (formState.inputModel.priority < 1) {
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.PRIORITY_INVALID_MIN');
                } if (formState.inputModel.priority > 10) {
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.PRIORITY_INVALID_MAX');
                }
                return '';
            }),
            isPriorityValid: computed(() => !(formState.inputModel.priority < 1 || formState.inputModel.priority > 10)),
            versionInvalidText: computed(() => {
                if (formState.inputModel.version.length === 0) {
                    return vm.$t('PLUGIN.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
                }
                return '';
            }),
            isVersionValid: computed(() => !(formState.inputModel.version.length === 0)),
            isConfValid: computed(() => formState.isNameValid && formState.isPriorityValid && formState.isVersionValid),
            isTagsValid: true,
            isAutoUpgrade: true,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.PLUGIN.PLUGIN'), path: '/plugin' },
                { name: vm.$t('MENU.PLUGIN.COLLECTOR'), path: '/plugin/collector' },
                { name: vm.$t('MENU.PLUGIN.CREATE_COLLECTOR') },
            ])),
        });
        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: 'conf',
                    label: vm.$t('PLUGIN.COLLECTOR.CREATE.TAB_SET_COLLECTOR'),
                },
                {
                    name: 'credentials',
                    label: vm.$t('PLUGIN.COLLECTOR.CREATE.TAB_CONFIRM_CREDENTIALS'),
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
                credentials: false,
                tags: !formState.isTagsValid,
            })),
            disabled: computed(() => some(tabState.invalidState, v => v === true)),
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
                console.error(e);
                showErrorMessage(vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_PLUGIN_TITLE'), e, vm.$root);
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
            state.collectorNames = res.results.map(v => v.name);
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
                console.error(e);
                showErrorMessage(vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'), e, vm.$root);
            }
        };

        /* event */
        const onChangeAutoUpgrade = () => {
            formState.isAutoUpgrade = !formState.isAutoUpgrade;
        };
        const onClickBackButton = () => {
            vm.$router.push({ name: PLUGIN_ROUTE.COLLECTOR.CREATE._NAME });
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
                priority: formState.inputModel.priority,
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
                showSuccessMessage(vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_S_CREATE_TITLE'), '', vm.$root);
                await vm.$router.push({ name: PLUGIN_ROUTE._NAME });
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PLUGIN.COLLECTOR.CREATE.ALT_E_CREATE_TITLE'), e, vm.$root);
            } finally {
                tabState.loading = false;
            }
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
            ...toRefs(routeState),
            tabState,
            onClickCancel,
            onClickConfirm,
            onClickBackButton,
            onChangeAutoUpgrade,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-creator-container {
    .collector-input-wrapper {
        @apply flex border-r border-gray-200;
        width: 50%;
        padding: 2.5rem;
        .p-text-input {
            width: 100%;
        }
    }
    .p-progress-wizard::v-deep {
        .contents {
            margin-top: 2.5rem;
        }
    }
}
</style>
