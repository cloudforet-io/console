import { toRefs } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import Cdg, { eventNames, cdgSetup } from '@/views/secret/credentials-group/CredentialsGroup.template.vue';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/secret/models/credential-model';

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
const actions = {
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
    clickRefresh() {
        return action('clickRefresh');
    },
};
export const defaultCase = () => ({
    extends: Cdg,
    setup(props, context) {
        // Show Credential Group List
        const cdgEventNames = eventNames;
        cdgEventNames.getCdgList = 'getCdg';
        cdgEventNames.getCdList = 'getCd';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        cdgEventNames.createCdg = 'createCdg';
        cdgEventNames.deleteCdg = 'deleteCdg';
        cdgEventNames.updateCdg = 'updateCdg';
        const state = cdgSetup(props, context, cdgEventNames);
        state.items = arrayOf(state.pageSize, casual._credentials_group);

        // Show Credential list
        state.cdgData.items = arrayOf(state.cdgData.pageSize, casual._credential);
        return {
            ...toRefs(state),
        };
    },
});
