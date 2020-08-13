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
                        <p-field-group :label="$t('COMMON.NAME')"
                                       :invalid-text="nameInvalidText"
                                       :invalid="!nameValidator.valid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="name" block
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                              :class="{'is-invalid': invalid}"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('COMMON.PRIORITY')"
                                       :invalid-text="priorityInvalidText"
                                       :invalid="!priorityValidator.valid"
                                       :required="true"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model.number="priority" block
                                              type="number"
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                              :class="{'is-invalid': invalid}"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group :label="$t('COMMON.VERSION')"
                                       :required="true"
                        >
                            <p-select-dropdown v-model="version" :items="versions" />
                        </p-field-group>
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
import { Validator } from 'jsonschema';

import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import ConfirmCredentials from '@/views/plugin/collector/modules/ConfirmCredentials.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/PProgressWizard.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup_deprecated.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { fluentApi } from '@/lib/fluent-api';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'CollectorCreator',
    components: {
        GeneralPageLayout,
        ConfirmCredentials,
        PProgressWizard,
        PDictInputGroup,
        PIconTextButton,
        PPageNavigation,
        PLazyImg,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentInstance;
        const validator = new Validator();
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
            name: '',
            priority: 10,
            version: null,
            //
            errorText: {
                format: 'name is duplicated',
                minLength: 'should NOT be shorter than 2 characters',
                minimum: 'should be >= 1',
                maximum: 'should be <= 10',
            },
            nameValidator: computed(() => validator.validate(state.name, {
                type: 'string',
                required: true,
                minLength: 2,
                format: 'nameFormat',
            })),
            priorityValidator: computed(() => validator.validate(state.priority, {
                type: 'number',
                required: true,
                minimum: 1,
                maximum: 10,
            })),
            nameInvalidText: computed(() => state.errorText[state.nameValidator.errors[0]?.name]),
            priorityInvalidText: computed(() => state.errorText[state.priorityValidator.errors[0]?.name]),
            isValid: computed(() => state.nameValidator.valid && state.priorityValidator.valid),
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

        const getPlugin = async (): Promise<void> => {
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
            const res = await fluentApi.inventory().collector().list()
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
                        state.versions.push({ label: `${value} (latest)`, name: value, type: 'item' });
                    } else {
                        state.versions.push({ label: value, name: value, type: 'item' });
                    }
                });
                state.version = res.data.results[0];
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
                name: state.name,
                priority: state.priority,
                tags: state.tags,
                plugin_info: {
                    plugin_id: state.pluginId,
                    version: state.version,
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
            state.loading = true;
            await getPlugin();
            //
            await getNames();
            validator.customFormats.nameFormat = input => !(state.names.includes(input)); // set name custom format
            //
            await getVersions();
            state.loading = false;
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
    }
}
</style>
