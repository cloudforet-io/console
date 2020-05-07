<template>
    <general-page-layout>
        <p-button class="back-btn" @click="goBackToCollectors">
            <p-i name="ic_back" color="transparent inherit" />
            {{ $t('INVENTORY.BACK_COL') }}
        </p-button>
        <p-progress-wizard :tabs="tabState.tabs"
                           :active-idx.sync="tabState.activeIdx"
                           :title="$t('INVENTORY.CRT_COLL')"
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
                <confirm-credentials :provider="provider" :supported-schema="supportedSchema" />
            </template>
            <template #contents-tags>
                <p-dict-input-group :dict.sync="tags" show-empty-input
                                    edit-mode
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

const PDictInputGroup = () => import('@/components/organisms/forms/dict-input-group/DictInputGroup_origin.vue');
const ConfigureCollector = () => import('@/views/plugin/collector/modules/ConfigureCollector.vue');
const ChooseCredentials = () => import('@/views/plugin/collector/modules/ChooseCredentials.vue');
const ConfirmCredentials = () => import('@/views/plugin/collector/modules/ConfirmCredentials.vue');


// const getConfState = root => reactive({
//     pluginId: _.get(root, '$route.params.pluginId', ''),
//     plugin: null,
//     loading: true,
//     name: '',
//     versions: [],
//     selectedVersion: _.get(root, '$route.query.version', ''),
//     priority: 10,
//     optionsValue: {},
//     provider: '',
//     pluginSchema: [],
// });

// export const setDataState = (root) => {
//     const state = reactive({
//         tags: {},
//         confState: getConfState(root),
//     });
//     watch(() => state.confState.plugin, (plugin) => {
//         const icon = _.get(plugin, 'tags.icon');
//         if (icon) state.tags.icon = icon;
//     });
//     return state;
// };

export default {
    name: 'CollectorCreator',
    components: {
        GeneralPageLayout,
        PButton,
        PI,
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
                root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: e.message,
                    duration: 2000,
                    speed: 1000,
                });
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
                root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: e.message,
                    duration: 2000,
                    speed: 1000,
                });
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

<style lang="postcss" scoped>
    .back-btn {
        @apply text-primary2;
        margin-bottom: 0.75rem;
        text-align: left;
        padding-left: 0;
    }
</style>
