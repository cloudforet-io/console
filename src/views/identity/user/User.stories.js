import { action } from '@storybook/addon-actions';
import User from './User.template';
import casual from '@/views/identity/user/models/user-model';
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'page/identity/user',
    component: User,
    parameters: {
        info: {
            summary: '',
            components: { User },
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


export const template = () => ({
    template: `
        <div class="animated fadeIn">
        <BaseDragHorizontal>
            <template #container="{ height }">
                <p-toolbox-table
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
                    :setting-visible="false"
                    @changePageSize="changePageSize"
                    @changePageNumber="changePageNumber"
                    @clickRefresh="clickRefresh"
                >
                    <template slot="toolbox-left">
                        <p-button
                            style-type="primary"
                            @click="clickAdd"
                        >
                            <p-i name="ic_plus" color="transparent white"
                                 width="1.3rem" height="1.3rem" :fill="true"
                            />
                            Create
                        </p-button>
                        <p-dropdown
                            id="user-dropdown-btn"
                            :menu="dropdown"
                            @click-update="clickUpdate"
                            @click-delete="clickDelete"
                            @click-activated="clickActivated"
                            @click-deactivated="clickDeactivated"
                        >
                            Actions
                        </p-dropdown>
                    </template>
                    <template slot="col-state" slot-scope="{value}">
                        <p-td>
                            <p-status v-bind="stateBind(value)" />
                        </p-td>
                    </template>
                </p-toolbox-table>
            </template>
        </BaseDragHorizontal>
        <div id="empty-space">
            Select a user above for details.
        </div>
    </div>`,
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
    },
    mixins: [User],
    computed: {
        items() {
            return arrayOf(this.pageSize, casual._user);
        },
    },
});
