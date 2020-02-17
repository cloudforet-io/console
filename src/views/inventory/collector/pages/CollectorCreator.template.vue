<template>
    <general-page-layout>
        <p-button class="back-btn" @click="goBackToCollectors">
            <p-i name="ic_back" color="transparent inherit" />
            {{ $t('INVENTORY.BACK_COL') }}
        </p-button>
        <p-progress-wizard :tabs.sync="tabs"
                           :labels="tabLabels"
                           :active-idx.sync="activeIdx"
                           :show-confirm="isAllTabValid"
                           :title="$t('INVENTORY.CRT_COLL')"
                           @cancel="onCancel"
                           @confirm="onConfirm"
                           @changeStep="onChangeStep"
        >
            <template #step-append-conf>
                <div class="empty-step-head" />
            </template>
            <template #contents-conf="{tab}">
                <configure-collector ref="conf"
                                     :show-validation="tab.showValidation"
                                     :plugin-id="confState.pluginId"
                                     :plugin="confState.plugin"
                                     :versions="confState.versions"
                                     :loading="confState.loading"
                                     :name.sync="confState.name"
                                     :selected-version.sync="confState.selectedVersion"
                                     :options-value.sync="confState.optionsValue"
                                     :priority.sync="confState.priority"
                                     @changeValidState="updateTabInvalid(0, $event)"
                />
            </template>
            <template #step-append-credentials>
                <div class="empty-step-head">
                    <router-link v-if="crdState.crdType === 'Credentials'" class="new-crd-btn"
                                 :to="{path: '/secret/credentials', query: {plugin_id: confState.pluginId}}"
                                 target="_blank"
                    >
                        <p-button outline style-type="dark">
                            {{ $t('INVENTORY.CRT_CRD') }}
                        </p-button>
                    </router-link>
                </div>
            </template>
            <template #contents-credentials>
                <choose-credentials ref="crd"
                                    :items="crdState.items"
                                    :plugin-id="confState.pluginId"
                                    :total-count="crdState.totalCount"
                                    :loading="crdState.loading"
                                    :crd-type.sync="crdState.crdType"
                                    :select-index.sync="crdState.selectIndex"
                                    @changeValidState="updateTabInvalid(1, $event)"
                />
            </template>
            <template #step-append-tags>
                <div class="empty-step-head" />
            </template>
            <template #contents-tags>
                <p-dict-input-group :dict.sync="tags" show-empty-input
                                    edit-mode
                />
            </template>
        </p-progress-wizard>
    </general-page-layout>
</template>

<script>
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/ProgressWizard.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';

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
    loading: true,
    name: '',
    versions: [],
    selectedVersion: _.get(root, '$route.query.version', ''),
    priority: 10,
    optionsValue: {},
});

/**
 * @param root
 * @returns {UnwrapRef<{confState: UnwrapRef<{plugin: null, selectedVersion: *, versions: [], optionsValue: {}, priority: number}>, crdState: UnwrapRef<{crdType: string, selectIndex: [], totalCount: number, loading: boolean, items: []}>, tags: {}}>}
 */
export const setDataState = (root) => {
    const state = reactive({
        tags: {},
        crdState: getCrdState(),
        confState: getConfState(root),
    });
    watch(() => state.confState.plugin, (plugin) => {
        const icon = _.get(plugin, 'tags.icon');
        if (icon) state.tags.icon = icon;
    });
    return state;
};

export default {
    name: 'CollectorCreator',
    components: {
        GeneralPageLayout,
        PButton,
        PI,
        PProgressWizard,
        ConfigureCollector,
        ChooseCredentials,
        PDictInputGroup,
    },
    setup(props, { refs, root, parent }) {
        const dataState = setDataState(root);

        const state = reactive({
            tabs: [
                {
                    key: 'conf',
                    showValidation: false,
                    invalid: true,
                },
                {
                    key: 'credentials',
                    showValidation: false,
                    invalid: true,
                },
                {
                    key: 'tags',
                    optional: true,
                },
            ],
            tabLabels: computed(() => ({
                conf: parent.$t('INVENTORY.CONF_COL'),
                credentials: parent.$t('INVENTORY.CHOOSE_CRD'),
                tags: parent.$t('INVENTORY.ADD_TAG'),
            })),
            activeIdx: 0,
            showConfirm: false,
        });

        const onCancel = () => {
            root.$router.go(-1);
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

            if (state.tabs[beforeIdx].key === 'conf') res = await refs.conf.validate();
            else if (state.tabs[beforeIdx].key === 'credentials') res = refs.crd.validate();
            else return;

            updateTabInvalid(beforeIdx, res);
        };

        const goBackToCollectors = () => {
            root.$router.push('/inventory/collector');
        };

        return {
            ...toRefs(dataState),
            ...toRefs(state),
            onCancel,
            onConfirm,
            isAllTabValid,
            updateTabInvalid,
            onChangeStep,
            goBackToCollectors,
        };
    },
};
</script>

<style lang="scss" scoped>
    .back-btn {
        margin-bottom: .75rem;
        color: $primary2;
        text-align: left;
        padding-left: 0;
    }
    .empty-step-head {
        height: 2rem;
    }
</style>
