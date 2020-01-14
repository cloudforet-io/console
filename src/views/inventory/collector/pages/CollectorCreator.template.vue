<template>
    <div class="collector-creator-container">
        <p-button class="back-btn">
            <p-i name="ic_back" color="transparent inherit" />
            Back to Plugins
        </p-button>
        <p-progress-wizard :tabs.sync="tabs"
                           :active-idx.sync="activeIdx"
                           :show-validation="showValidation"
                           :show-confirm="showConfirm"
                           title="CreateCollector"
                           @cancel="onCancel"
                           @confirm="onConfirm"
        >
            <template #contents-conf>
                <configure-collector :plugin="plugin" :versions="versions" />
            </template>
            <template #contents-credentials>
                <choose-credentials :items="credentials"
                                    :fields="fields"
                                    :total-count="totalCount"
                                    :loading="loading"
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
import { reactive, toRefs } from '@vue/composition-api';

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
    setup() {
        const dataState = setDataState();

        const state = reactive({
            tabs: [
                {
                    key: 'conf',
                    label: 'Configure Collector',
                    invalid: true,
                },
                {
                    key: 'credentials',
                    label: 'Choose Credentials',
                },
                {
                    key: 'tags',
                    label: 'Add Tags',
                    optional: true,
                },
            ],
            activeIdx: 0,
            showValidation: false,
            showConfirm: false,
        });

        const onCancel = () => {};
        const onConfirm = () => {};


        return {
            ...toRefs(dataState),
            ...toRefs(state),
            onCancel,
            onConfirm,
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
