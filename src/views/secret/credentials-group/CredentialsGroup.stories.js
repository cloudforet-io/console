import { toRefs, reactive, computed } from '@vue/composition-api'
import { action } from '@storybook/addon-actions';
import Cdg from './CredentialsGroup.template.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue'
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue'
import { eventNames, cdgSetup } from '@/views/secret/credentials-group/CredentialsGroup.template'
import { arrayOf } from '@/lib/casual'
import casual from '@/views/secret/models/credential-model'
import { mountBusEvent } from '@/lib/compostion-util';
import CdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus'

export default {
    title: 'view/secret/credentialsGroup',
    component: Cdg,
    parameters: {
        info: {
            summary: '',
            components: { Cdg },
        },
    },
};
const actions = {};
export const defaultCase = () => ({
    template: `${Cdg.template}`,
    components: { PToolboxTable, PHorizontalLayout },
    mixins: [Cdg],
    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdg = 'getCdg';
        cdgEventNames.tagConfirmEvent = 'ServerTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        cdgEventNames.addCdg = 'addCdg';
        cdgEventNames.deleteCdg = 'deleteCdg';
        cdgEventNames.updateCdg = 'updateCdg';
        const state = cdgSetup(props, context, cdgEventNames);
        console.log(state);
        const items = computed(() => arrayOf(state.pageSize, casual._credentials_group));
        return {
            ...toRefs(state),
            items,
        };
    },
});
