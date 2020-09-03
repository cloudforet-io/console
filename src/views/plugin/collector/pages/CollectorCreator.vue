<template>
    <general-page-layout class="collector-creator-page">
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
        >
            <template #contents-conf="{tab}">
                <div class="collector-input-lap">
                    <p-lazy-img class="flex-shrink-0 mr-8"
                                :img-url="imageUrl"
                                width="5.5rem" height="5.5rem"
                    />
                    <div class="flex-grow">
                        <p-dynamic-form
                            :schema="inputSchema"
                            :model="inputModel"
                            :options="inputOptions"
                            :is-valid.sync="isValid"
                        />
                    </div>
                </div>
            </template>
            <template #contents-credentials>
                <confirm-credentials :provider="provider" :supported-schema="supportedSchema" class="mt-8" />
            </template>
            <template #contents-tags>
                <p-dict-input-group :dict.sync="tags" show-empty-input
                                    edit-mode class="mt-8"
                />
            </template>
        </p-progress-wizard>
    </general-page-layout>
</template>

<script lang="ts">
import { get, some } from 'lodash';
import VueFormGenerator from 'vue-form-generator/dist/vfg';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import ConfirmCredentials from '@/views/plugin/collector/modules/ConfirmCredentials.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/PProgressWizard.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup_deprecated.vue';
import PDynamicForm from '@/components/organisms/forms/dynamic-form/PDynamicForm.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

import { fluentApi } from '@/lib/fluent-api';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'CollectorCreator',
    components: {
        PDynamicForm,
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
            versions: [],
            names: [],
            //
            isValid: false,
            inputModel: {
                name: '',
                priority: 10,
                version: '',
            },
            inputSchema: {
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        label: vm.$t('COMMON.NAME'),
                        model: 'name',
                        min: 2,
                        required: true,
                        validator: [VueFormGenerator.validators.string.locale({
                            fieldIsRequired: 'should NOT be shorter than 2 characters',
                            textTooSmall: 'should NOT be shorter than 2 characters',
                        }), (value) => {
                            if (state.names.includes(value)) {
                                return ['Name is duplicated'];
                            }
                            return [];
                        }],
                    },
                    {
                        type: 'input',
                        inputType: 'number',
                        label: vm.$t('COMMON.PRIORITY'),
                        model: 'priority',
                        min: 1,
                        max: 10,
                        required: true,
                        validator: VueFormGenerator.validators.number.locale({
                            numberTooSmall: 'should be >= 1',
                            numberTooBig: 'should be <= 10',
                        }),
                    },
                    {
                        type: 'select',
                        label: vm.$t('COMMON.VERSION'),
                        model: 'version',
                        values: [],
                        hideNoneSelectedText: true,
                        required: true,
                        validator: VueFormGenerator.validators.select,
                    },
                ],
            },
            inputOptions: {
                validateAfterLoad: true,
                validateAfterChanged: true,
                validateAsync: true,
            },
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
                conf: !state.isValid,
                credentials: false,
                tags: false,
            })),
            disabled: computed(() => some(tabState.invalidState, v => v === true)),
        });

        const getPlugin = async () => {
            try {
                const res = await fluentApi.repository().plugin().get().setId(state.pluginId)
                    .execute();
                state.plugin = res.data;
                state.supportedSchema = res.data.capability.supported_schema;
                if (res.data.tags?.icon) state.tags.icon = res.data.tags.icon;
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Plugin', e, root);
            }
        };
        const getNames = async () => {
            const res = await fluentApi.inventory().collector().list().setOnly('name')
                .execute();
            state.names = res.data.results.map(v => v.name);
        };
        const getVersions = async () => {
            try {
                state.versions = [];
                const res = await fluentApi.repository().plugin().getVersions().setId(state.pluginId)
                    .execute();
                res.data.results.forEach((value, index) => {
                    if (index === 0) {
                        state.versions.push({ name: `${value} (latest)`, id: value });
                    } else {
                        state.versions.push({ name: value, id: value });
                    }
                });
                state.inputModel.version = res.data.results[0];
                state.inputSchema.fields[2].values = state.versions;
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
        const onClickConfirm = async () => {
            if (!state.isValid) {
                return;
            }

            tabState.loading = true;
            const params = {
                name: state.inputModel.name,
                priority: state.inputModel.priority,
                tags: state.tags,
                plugin_info: {
                    plugin_id: state.pluginId,
                    version: state.inputModel.version,
                    provider: state.provider,
                },
            };
            try {
                await fluentApi.inventory().collector().create()
                    .setParameter(params)
                    .execute();
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
            ...toRefs(routeState),
            tabState,
            onClickCancel,
            onClickConfirm,
            onClickBackButton,
        };
    },
};
</script>

<style lang="postcss">
.collector-creator-page {
    .collector-input-lap {
        @apply flex border-r border-gray-200;
        width: 50%;
        padding: 2.5rem;
        margin-top: 2rem;
    }
}
</style>
