<template>
    <div class="collector-creator-container">
        <p-button class="back-btn">
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
                <configure-collector ref="conf" :plugin="plugin" :versions="versions"
                                     :show-validation="tab.showValidation"
                                     @changeValidState="updateTabInvalid(0, $event)"
                />
            </template>
            <template #contents-credentials>
                <choose-credentials ref="crd" :items="credentials"
                                    :fields="fields"
                                    :total-count="totalCount"
                                    :loading="loading"
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

import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/ProgressWizard.vue';

const ConfigureCollector = () => import('@/views/inventory/collector/modules/ConfigureCollector.vue');
const ChooseCredentials = () => import('@/views/inventory/collector/modules/ChooseCredentials.vue');
const PDictInputGroup = () => import('@/components/organisms/forms/dict-input-group/DictInputGroup.vue');

export const setDataState = (props, args) => reactive({
    plugin: undefined,
    versions: undefined,
    credentials: [],
    fields: ['credential_id', 'name', 'issue_type', 'credential_groups'],
    totalCount: 0,
    loading: true,
    tags: {},
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
    setup(props, { refs }) {
        const dataState = setDataState();

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

        const onCancel = () => {};
        const onConfirm = () => {};

        const isAllTabValid = computed(() => _.every(state.tabs, tab => !!tab.invalid === false));

        const updateTabInvalid = (tabIdx, value) => {
            state.tabs[tabIdx] = { ...state.tabs[tabIdx], invalid: !value };
            state.tabs = [...state.tabs];
        };

        const onChangeStep = async (beforeIdx) => {
            let res = null;

            if (state.tabs[beforeIdx].key === 'conf') res = await refs.conf.allValidation();
            else if (state.tabs[beforeIdx].key === 'credentials') res = refs.crd.validate();
            else return;

            updateTabInvalid(beforeIdx, res);
        };


        return {
            ...toRefs(dataState),
            ...toRefs(state),
            onCancel,
            onConfirm,
            isAllTabValid,
            updateTabInvalid,
            onChangeStep,
        };
    },
};
</script>

<style lang="scss" scoped>
.collector-creator-container {
    .back-btn {
        margin-bottom: .75rem;
        color: $primary2;
        text-align: left;
        padding-left: 0;
    }
}
</style>
