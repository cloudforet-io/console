<template>
    <div class="collector-creator-container">
        <p-button class="back-btn" @click="goBack">
            <p-i name="ic_back" color="transparent inherit" />
            Back to Plugins
        </p-button>
        <p-progress-wizard :tabs.sync="tabs"
                           :active-idx.sync="activeIdx"
                           :show-confirm="isAllTabValid"
                           title="CreateCollector"
                           @cancel="onCancel"
                           @confirm="onConfirm"
                           @changeStep="onChangeStep"
        >
            <template #contents-conf="{tab}">
                <configure-collector ref="conf"
                                     :show-validation="tab.showValidation"
                                     :plugin-id="confState.pluginId"
                                     :plugin="confState.plugin"
                                     :versions="confState.versions"
                                     :selected-version.sync="confState.selectedVersion"
                                     :options-value.sync="confState.optionsValue"
                                     :priority.sync="confState.priority"
                                     @changeValidState="updateTabInvalid(0, $event)"
                />
            </template>
            <template v-if="crdState.crdType === 'Credentials'" #step-append-credentials>
                <router-link class="new-crd-btn" to="/secret" target="_blank">
                    <p-button outline style-type="dark">
                        {{ tr('INVENTORY.CRT_CRD') }}
                    </p-button>
                </router-link>
            </template>
            <template #contents-credentials>
                <choose-credentials ref="crd"
                                    :items="crdState.items"
                                    :total-count="crdState.totalCount"
                                    :loading="crdState.loading"
                                    :crd-type.sync="crdState.crdType"
                                    :select-index.sync="crdState.selectIndex"
                                    @changeValidState="updateTabInvalid(1, $event)"
                />
            </template>
            <template #contents-tags>
                <p-dict-input-group :dict.sync="tags" show-empty-input
                                    edit-mode
                />
            </template>
        </p-progress-wizard>
    </div>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/ProgressWizard.vue';

const PDictInputGroup = () => import('@/components/organisms/forms/dict-input-group/DictInputGroup.vue');
const ConfigureCollector = () => import('@/views/inventory/collector/modules/ConfigureCollector.vue');
const ChooseCredentials = () => import('@/views/inventory/collector/modules/ChooseCredentials.vue');

const getCrdState = () => reactive({
    items: [],
    totalCount: 0,
    loading: true,
    crdType: 'Credentials',
    selectIndex: [],
});

const getConfState = root => reactive({
    pluginId: _.get(root, '$route.params.pluginId', ''),
    plugin: null,
    versions: [],
    selectedVersion: _.get(root, '$route.query.version', ''),
    priority: 10,
    optionsValue: {},
});

/**
 * @param root
 * @returns {UnwrapRef<{confState: UnwrapRef<{plugin: null, selectedVersion: *, versions: [], optionsValue: {}, priority: number}>, crdState: UnwrapRef<{crdType: string, selectIndex: [], totalCount: number, loading: boolean, items: []}>, tags: {}}>}
 */
export const setDataState = root => reactive({
    tags: {},
    crdState: getCrdState(),
    confState: getConfState(root),
});

export default {
    name: 'CollectorCreator',
    components: {
        PButton,
        PI,
        PProgressWizard,
        ConfigureCollector,
        ChooseCredentials,
        PDictInputGroup,
    },
    setup(props, { refs, root }) {
        const dataState = setDataState(root);

        const state = reactive({
            tabs: [
                {
                    key: 'conf',
                    label: 'Configure Collector',
                    showValidation: false,
                    invalid: true,
                },
                {
                    key: 'credentials',
                    label: 'Choose Credentials',
                    showValidation: false,
                    invalid: true,
                },
                {
                    key: 'tags',
                    label: 'Add Tags',
                    optional: true,
                },
            ],
            activeIdx: 0,
            showConfirm: false,
        });

        const onCancel = () => {
            root.$router.push('/inventory/collector');
        };
        const onConfirm = () => {
            CollectorEventBus.$emit('createCollector');
        };

        const isAllTabValid = computed(() => _.every(state.tabs, tab => !!tab.invalid === false));

        const updateTabInvalid = (tabIdx, value) => {
            state.tabs[tabIdx] = { ...state.tabs[tabIdx], invalid: !value };
            state.tabs = [...state.tabs];
        };

        const onChangeStep = async (beforeIdx) => {
            let res = null;

            if (state.tabs[beforeIdx].key === 'conf') res = await refs.conf.vdApi.allValidation();
            else if (state.tabs[beforeIdx].key === 'credentials') res = refs.crd.validate();
            else return;

            updateTabInvalid(beforeIdx, res);
        };

        const goBack = () => {
            root.$router.push('../plugins');
        };


        return {
            ...toRefs(dataState),
            ...toRefs(state),
            onCancel,
            onConfirm,
            isAllTabValid,
            updateTabInvalid,
            onChangeStep,
            goBack,
        };
    },
};
</script>

<style lang="scss" scoped>
.collector-creator-container {
    padding: 1.75rem 2rem 2rem 2rem;
    .back-btn {
        margin-bottom: .75rem;
        color: $primary2;
        text-align: left;
        padding-left: 0;
    }
    .new-crd-btn {

    }
}
</style>
