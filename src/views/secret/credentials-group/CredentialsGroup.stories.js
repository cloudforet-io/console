import { toRefs, reactive, computed } from '@vue/composition-api'
import { action } from '@storybook/addon-actions';
import CredentialsGroup from './CredentialsGroup.template.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue'
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue'
import { eventNames, credentialsGroupSetup } from '@/views/secret/credentials-group/CredentialsGroup.template'
import { arrayOf } from '@/lib/casual'
import casual from '@/views/secret/models/credential-model'
import { mountBusEvent } from '@/lib/compostion-util';
import CGPEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus'

export default {
    title: 'view/secret/credentialsGroup',
    component: CredentialsGroup,
    parameters: {
        info: {
            summary: '',
            components: { CredentialsGroup },
        },
    },
};
const actions = {};
export const defaultCase = () => ({
    template: `${CredentialsGroup.template}`,
    components: { PToolboxTable, PHorizontalLayout },
    mixins: [CredentialsGroup],
    setup(props, context) {
        const CGPEventNames = eventNames;
        CGPEventNames.getCredentialsGroupList = 'getCredentialsGroupList';
        CGPEventNames.tagConfirmEvent = 'ServerTagConfirmEvent';
        CGPEventNames.tagResetEvent = 'resetTagEvent';
        CGPEventNames.addCredentialsGroup = 'addCredentialsGroup';
        CGPEventNames.deleteCredentialsGroup = 'deleteCredentialsGroup';
        CGPEventNames.updateCredentialsGroup = 'updateCredentialsGroup';
        const state = credentialsGroupSetup(props, context, CGPEventNames);
        console.log(state);
        const items = computed(() => arrayOf(state.pageSize, casual._credential_group));
        return {
            ...toRefs(state),
            items,
        };
    },
});
