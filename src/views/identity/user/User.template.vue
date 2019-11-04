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
                    :responsive-style="{'height': `${height}px`, 'overflow-y':'auto'}"
                    :settingVisible="false"
                    @changePageSize="changePageSize"
                    @changePageNumber="changePageNumber"
                    @clickRefresh="clickRefresh"
                >
                    <template slot="toolbox-left">
                        <p-button
                            style-type="primary"
                            @click="clickAdd"
                        >
                            Create
                        </p-button>
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

export default {
    name: 'User',
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
        PTd,
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
    },

};


</script>
