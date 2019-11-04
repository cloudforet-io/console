<template>
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
                            <p-i name="ic_plus" color="transparent white" :fill="true" /> Create
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
                    <template slot="col-state" slot-scope="data">
                        <p-td>
                            {{ data.state }}
                            <p-status
                                v-if="data.state==='ENABLED'"
                                icon="fa-circle"
                                icon-style="solid"
                                size="xs"
                                text="enabled"
                                icon-color="#60B731"
                            />
                            <p-status
                                v-else
                                icon="fa-circle"
                                icon-style="solid"
                                size="xs"
                                text="disabled"
                                icon-color="#EA390F"
                                text-color="#EA390F"
                            />
                        </p-td>
                    </template>
                </p-toolbox-table>
            </template>
        </BaseDragHorizontal>
        <div>
            this is empty
        </div>
    </div>
</template>

<script>
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import PTd from '@/components/atoms/table/Td';
import PI from '@/components/atoms/icons/PI';
import PDropdown from '@/components/organisms/buttons/dropdown/Dropdown';

export default {
    name: 'User',
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
        PTd,
        PI,
        PDropdown,
    },
    data() {
        return {
            sortBy: null,
            sortDesc: true,
            thisPage: 1,
            allPage: 10,
            pageSize: 15,
            selectIndex: [],
            fields: [{ name: 'user_id', label: 'id' }, 'name', 'email', 'state', 'mobile', 'group', 'language', 'timezone'],
            items: [],
            dropdown: [
                {
                    type: 'item', text: 'update', event: 'update', disabled: false,
                },
                {
                    type: 'item', text: 'delete', event: 'delete', disabled: false,
                },
                {
                    type: 'item', text: 'activated', event: 'activated', disabled: false,
                },
                {
                    type: 'item', text: 'deactivated', event: 'deactivated', disabled: false,
                },
            ],
        };
    },
    methods: {
        clickAdd() {
            console.log('add');
        },
        changePageSize() {

        },
        changePageNumber() {

        },
        clickRefresh() {},
        clickUpdate() {},
        clickDelete() {},
        clickActivated() {},
        clickDeactivated() {},
    },

};


</script>

<style lang="scss" scoped>
    #user-dropdown-btn{
        margin-left: 1rem;
    }
</style>
