<template>
    <div class="credentialsGroup">
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :dragable="true"
                    :hover="true"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}"
                    :setting-visible="false"
                    :loading="loading"
                    :use-spinner-loading="true"
                    :use-cursor-loading="true"
                    @changePageSize="getCredentialGroups"
                    @changePageNumber="getCredentialGroups"
                    @clickRefresh="getCredentialGroups"
                    @changeSort="getCredentialGroups"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickAdd">
                            {{ tr('COMMON.BTN_ADD') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-enable="clickEnable"
                            @click-disable="clickDisable"
                            @click-delete="clickDelete"
                            @click-update="clickUpdate"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getCredentialGroups" />
                        </div>
                    </template>
                    <template v-slot:col-state-format="{value}">
                        <p-status v-bind="credentialGroupStateFormatter(value)" />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-credential-group-detail ref="credentialGroupDetail"
                                           :item="items[selectIndex[0]]"
                                           :tag-confirm-event="tagConfirmEvent"
                                           :tag-reset-event="tagResetEvent"
                />
            </template>
            <template #credentials="{tabName}">
                <p-credential-group-data

                />
            </template>
        </PTab>
    </div>
</template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
    </div>
</template>

<script>
import PToolboxTable from '../../../components/organisms/tables/toolbox-table/ToolboxTable';

export default {
    name: 'CredentialGroup',
    components: { PToolboxTable },
};
</script>

<style scoped>

</style>
