<template>
    <general-page-layout>
        <p-icon-text-button name="ic_back" class="text-2xl mb-6 p-0"
                            icon-color="transparent inherit"
                            width="1.5rem" height="1.5rem"
                            @click="goBackToCollectors"
        >
            {{ $t('INVENTORY.CRT_COLL') }}
        </p-icon-text-button>
        <p-progress-wizard :tabs="tabState.tabs"
                           :active-idx.sync="tabState.activeIdx"
                           :confirm-btn-bind="tabState.confirmBtnBind"
                           :invalid-state="tabState.invalidState"
                           @cancel="onCancel"
                           @confirm="onConfirm"
                           @changeStep="onChangeStep"
        >
            <template #contents-conf="{tab}">
                <configure-collector ref="conf"
                                     :enable-validation="enableValidation"
                                     :plugin-id="pluginId"
                                     :options-schema="optionsSchema"
                                     :img-url="imgUrl"
                                     :form.sync="form"
                                     :is-valid.sync="isValid"
                />
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
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/ProgressWizard.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import { fluentApi } from '@/lib/fluent-api';
import { JsonSchemaObjectType } from '@/lib/type';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import { showErrorMessage } from '@/lib/util';

const PDictInputGroup = () => import('@/components/organisms/forms/dict-input-group/DictInputGroup_origin.vue');
const ConfigureCollector = () => import('@/views/plugin/collector/modules/ConfigureCollector.vue');
const ChooseCredentials = () => import('@/views/plugin/collector/modules/ChooseCredentials.vue');
const ConfirmCredentials = () => import('@/views/plugin/collector/modules/ConfirmCredentials.vue');

export default {
    name: 'CollectorCreator',
    components: {
        PIconTextButton,
        GeneralPageLayout,
        PProgressWizard,
        ConfigureCollector,
        ConfirmCredentials,
        PDictInputGroup,
    },
    setup(props, { refs, root, parent }) {
        const state: any = reactive({
            form: {},
            optionsSchema: null,
            imgUrl: '',
            isValid: true,
            enableValidation: false,
            pluginId: _.get(root, '$route.params.pluginId', ''),
            provider: '',
            tags: {},
            supportedSchema: [],
        });


        const pluginApi = fluentApi.repository().plugin();

        const getPlugin = async (): Promise<void> => {
            try {
                const res = await pluginApi.get().setId(state.pluginId).execute();
                state.optionsSchema = _.get(res.data,
                    'template.options.schema',
                    new JsonSchemaObjectType());
                state.provider = res.data.provider;
                state.imgUrl = _.get(res.data, 'tags.icon', '');
                state.tags = {};
                if (res.data.tags?.icon) state.tags.icon = res.data.tags.icon;
                state.supportedSchema = res.data.capability.supported_schema;
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Plugin', e, root);
            }
        };
        getPlugin();

        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: 'conf',
                    label: parent.$t('INVENTORY.TAB.CONF_COLLECTOR'),
                },
                {
                    name: 'credentials',
                    label: parent.$t('INVENTORY.TAB.CONFIRM_CRD'),
                },
                {
                    name: 'tags',
                    label: parent.$t('INVENTORY.TAB.ADD_TAG'),
                    // optional: true,
                },
            ]),
            activeIdx: 0,
            confirmBtnBind: computed(() => ({
                disabled: !state.enableValidation || !state.isValid,
            })),
            invalidState: computed(() => ({
                conf: state.enableValidation && !state.isValid,
                credentials: false,
                tags: false,
            })),
        });

        const onCancel = () => {
            root.$router.go(-1);
        };
        const onConfirm = async () => {
            const params = {
                name: state.form.name,
                priority: state.form.priority,
                tags: state.tags,
                // eslint-disable-next-line camelcase
                plugin_info: {
                    // eslint-disable-next-line camelcase
                    plugin_id: state.pluginId,
                    version: state.form.plugin_info.version,
                    provider: state.provider,
                },
            };
            try {
                await fluentApi.inventory().collector().create()
                    .setParameter(params)
                    .execute();

                root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'create collector',
                    duration: 2000,
                    speed: 1000,
                });

                await root.$router.push('/plugin/collector');
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Create Collector', e, root);
            }
        };

        const onChangeStep = async (beforeIdx) => {
            if (beforeIdx === 0) {
                state.enableValidation = true;
                const res = await refs.conf.validate();
            }
        };

        const goBackToCollectors = () => {
            root.$router.push('/plugin/collector/create/plugins');
        };

        return {
            tabState,
            ...toRefs(state),
            onCancel,
            onConfirm,
            onChangeStep,
            goBackToCollectors,
        };
    },
};
</script>
