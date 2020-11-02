<template>
    <general-page-layout class="collector-creator-container">
        <div class="page-navigation">
            <p-page-navigation :routes="routes" />
        </div>
        <p-icon-text-button name="ic_back" class="text-2xl mb-6 p-0"
                            icon-color="transparent inherit"
                            width="1.5rem" height="1.5rem"
                            @click="onClickBackButton"
        >
            {{ $t('INVENTORY.CRT_COLL') }}
        </p-icon-text-button>
        <p-progress-wizard :tabs="tabState.tabs"
                           :active-idx.sync="tabState.activeIdx"
                           :invalid-state="tabState.invalidState"
                           :loading="tabState.loading"
                           :disabled="tabState.disabled"
                           @cancel="onClickCancel"
                           @confirm="onClickConfirm"
                           @changeStep="onChangeStep"
        >
            <template #contents-conf="{tab}">
                <div class="collector-input-wrapper">
                    <p-lazy-img class="flex-shrink-0 mr-8"
                                :loading="!imageUrl"
                                :src="imageUrl"
                                width="5.5rem" height="5.5rem"
                    />
                    <div class="flex-grow">
                        <p-field-group label="name" :invalid-text="nameInvalidText" :invalid="!isNameValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="inputModel.name" class="block" :class="{'is-invalid': invalid}" />
                            </template>
                        </p-field-group>
                        <p-field-group label="priority" :invalid-text="priorityInvalidText" :invalid="!isPriorityValid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="inputModel.priority" type="number" class="block"
                                              :class="{'is-invalid': invalid}"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group label="version" :invalid="!isVersionValid" :required="true">
                            <p-select-dropdown v-model="inputModel.version" :items="versions" auto-height />
                        </p-field-group>
                    </div>
                </div>
            </template>
            <template #contents-credentials>
                <confirm-credentials :provider="provider" :supported-schema="supportedSchema" class="mt-8" />
            </template>
            <template #contents-tags>
                <p-dict-input-group ref="dictRef"
                                    :dict="tags"
                                    show-validation
                                    class="mt-8"
                                    @change="onChangeTags"
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

import GeneralPageLayout from '@/views/common/page-layout/GeneralPageLayout.vue';
import ConfirmCredentials from '@/views/plugin/collector/modules/ConfirmCredentials.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/PProgressWizard.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'CollectorCreator',
    components: {
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        GeneralPageLayout,
        ConfirmCredentials,
        PProgressWizard,
        PDictInputGroup,
        PIconTextButton,
        PPageNavigation,
        PLazyImg,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            plugin: {},
            imageUrl: computed(() => get(state.plugin, 'tags.icon', '')),
            provider: computed(() => get(state.plugin, 'provider', '')),
            pluginId: get(root, '$route.params.pluginId', ''),
            tags: {},
            supportedSchema: [],
            //
            collectorNames: [],
            versions: [],
            dictRef: null as any,
        });
        const formState = reactive({
            inputModel: {
                name: '',
                priority: 10,
                version: '',
            },
            nameInvalidText: computed(() => {
                if (formState.inputModel.name.length < 2) {
                    return 'should NOT be shorter than 2 characters';
                } if (state.collectorNames.includes(formState.inputModel.name)) {
                    return 'Name is duplicated';
                }
                return '';
            }),
            isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
            priorityInvalidText: computed(() => {
                if (formState.inputModel.priority < 1) {
                    return 'should be >= 1';
                } if (formState.inputModel.priority > 10) {
                    return 'should be <= 10';
                }
                return '';
            }),
            isPriorityValid: computed(() => !(formState.inputModel.priority < 1 || formState.inputModel.priority > 10)),
            versionInvalidText: computed(() => {
                if (formState.inputModel.version.length === 0) {
                    return 'select version';
                }
                return '';
            }),
            isVersionValid: computed(() => !(formState.inputModel.version.length === 0)),
            isTagsValid: true,
            isValid: computed(() => formState.isNameValid && formState.isPriorityValid && formState.isVersionValid),
        });
        const routeState = reactive({
            routes: [{ name: 'Plugin', path: '/plugin' }, { name: 'Collector', path: '/plugin/collector' },
                { name: 'Create collector', path: '/plugin/collector/create/plugins' }],
        });
        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: 'conf',
                    label: vm.$t('INVENTORY.TAB.CONF_COLLECTOR'),
                },
                {
                    name: 'credentials',
                    label: vm.$t('INVENTORY.TAB.CONFIRM_CRD'),
                },
                {
                    name: 'tags',
                    label: vm.$t('INVENTORY.TAB.ADD_TAG'),
                    optional: true,
                },
            ]),
            activeIdx: 0,
            loading: false,
            invalidState: computed(() => ({
                conf: !formState.isValid,
                credentials: false,
                tags: !formState.isTagsValid,
            })),
            disabled: computed(() => some(tabState.invalidState, v => v === true)),
        });

        const getPlugin = async () => {
            try {
                const res = await SpaceConnector.client.repository.plugin.get({
                    plugin_id: state.pluginId,
                });
                state.plugin = res;
                state.supportedSchema = res.capability.supported_schema;
                if (res.tags?.icon) {
                    state.tags.icon = res.tags.icon;
                }
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Plugin', e, root);
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
                showErrorMessage('Fail to Get Versions', e, root);
            }
        };

        const onClickBackButton = () => {
            root.$router.push('/plugin/collector/create/plugins');
        };
        const onClickCancel = () => {
            root.$router.go(-1);
        };

        const onChangeStep = () => {
            // set tags only when the current tab is tags (when dictRef exist)
            if (state.dictRef) {
                formState.isTagsValid = state.dictRef.allValidation();
                state.tags = state.dictRef.getDict();
            }
        };

        const onChangeTags = () => {
            formState.isTagsValid = state.dictRef.isAllValid;
        };

        const onClickConfirm = async () => {
            if (!formState.isValid && formState.isTagsValid) {
                return;
            }

            // set tags only when the current tab is tags (when dictRef exist)
            if (state.dictRef) {
                state.tags = state.dictRef.getDict();
            }

            tabState.loading = true;
            const params = {
                name: formState.inputModel.name,
                priority: formState.inputModel.priority,
                tags: state.tags,
                plugin_info: {
                    plugin_id: state.pluginId,
                    version: formState.inputModel.version,
                    provider: state.provider,
                },
            };
            try {
                await SpaceConnector.client.inventory.collector.create(params);
                showSuccessMessage('success', 'Create Collector', root);
                await root.$router.push('/plugin/collector');
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Create Collector', e, root);
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
            onChangeStep,
            onChangeTags,
            onClickBackButton,
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
        margin-top: 2rem;
        .p-text-input {
            width: 100%;
        }
    }
}
</style>
