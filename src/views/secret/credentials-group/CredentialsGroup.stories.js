import { toRefs, reactive, computed } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import Cdg, { eventNames, cdgSetup } from '@/views/secret/credentials-group/CredentialsGroup.template.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PCdgDetail from '@/views/secret/credentials-group/modules/CredentialGroupDetail.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/secret/models/credential-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

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
    template: `${Cdg.template}`,
    components: {
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PDropdownMenuBtn,
        PCdgDetail,
        PTab,
        PSearch,
        PTableCheckModal,
        PDataTable,
    },
    mixins: [Cdg],
    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdg = 'getCdg';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        cdgEventNames.createCdg = 'createCdg';
        cdgEventNames.deleteCdg = 'deleteCdg';
        cdgEventNames.updateCdg = 'updateCdg';
        const state = cdgSetup(props, context, cdgEventNames);
        state.items = arrayOf(state.pageSize, casual._credentials_group);
        return {
            ...toRefs(state),
        };
    },
});
