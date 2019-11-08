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
                    <template slot="col-state" slot-scope="data">
                        <p-td>
                            <p-status
                                    v-bind="stateBind(data.state)"
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
        <div id="empty-space">
            Select a user above for details.
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
    computed: {
        items() {
            return [];
        },
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
        stateBind(state) {
            const obj = {
                icon: 'fa-circle',
                iconStyle: 'solid',
                size: 'xs',
            };
            if (state === 'ENABLED') {
                obj.text = 'enabled';
                obj.iconColor = '#60B731';
            } else {
                obj.text = 'disabled';
                obj.iconColor = '#60B731';
                obj.iconColor = '#60B731';
            }
            return obj;
        },
    },

};


</script>

<style lang="scss" scoped>
    #user-dropdown-btn {
        margin-left: 1rem;
    }
    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        color: $primary2;
        font: 24px/32px Arial;
    }
</style>
