import { toRefs } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import addCdg, { eventNames, cdgSetup } from '@/views/secret/credentials-group/pages/AddCredentials.template.vue';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/secret/models/credential-model';

export default {
    title: 'view/secret/addCredential',
    component: addCdg,
    parameters: {
        info: {
            summary: '',
            components: { addCdg },
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
    extends: addCdg,
    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdList = 'getCd';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        cdgEventNames.addCd = 'addCd';
        cdgEventNames.deletCd = 'deleteCd';
        const state = cdgSetup(props, context, cdgEventNames);
        state.items = arrayOf(state.pageSize, casual._credentials_group);
        state.cdData.items = arrayOf(state.cdData.pageSize, casual._credential);
        return {
            ...toRefs(state),
        };
    },
});
