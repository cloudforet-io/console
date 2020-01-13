<template>
    <div>
        <p-progress-wizard :tabs.sync="tabs"
                           :active-idx.sync="activeIdx"
                           :show-validation="showValidation"
                           :show-confirm="showConfirm"
                           :title="title"
                           style="width: 100vw;"
                           @cancel="onCancel"
                           @confirm="onConfirm"
        >
            <template v-for="(tab) in tabs"
                      :slot="'contents-' + tab.key"
            />
        </p-progress-wizard>
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/ProgressWizard.vue';

export default {
    name: 'CollectorCreator',
    components: {
        PProgressWizard,
    },
    setup() {
        const state = reactive({
            tabs: [
                {
                    key: 'conf',
                    label: 'Configure Collector',
                    alert: 'This is alert message!!',
                    unvalid: true,
                    optional: true,
                },
                {
                    key: 'credentials',
                    label: 'Choose Credentials',
                    warning: 'This is warning messasge',
                },
                {
                    key: 'tags',
                    label: 'Add Tags',
                    help: 'This is description of add tags step.',
                },
            ],
            activeIdx: 0,
            showValidation: false,
            showConfirm: false,
        });

        const onCancel = () => {};
        const onConfirm = () => {};


        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
