<template>
    <p-button-modal
        ref="modal"
        :scrollable="true"
        :centered="true"
        size="xl"
        :fade="true"
        :backdrop="true"
        :header-title="getMemberModalTitle"
        :visible.sync="visible"
        @close="close"
        @confirm="confirm"
    >
        <template #body>
            <p-toolbox-table :items="users"
                             :responsive-style="{'height': '30vh', 'overflow-y':'auto', 'box-shadow': 'none', 'border':'none'}"
                             :fields="selectedFields"
                             :selectable="false"
                             :sortable="true"
                             :shadow="false"
                             :border="false"
                             :hover="true"
                             :padding="false"
                             :sort-by.sync="tablePage.sortBy"
                             :sort-desc.sync="tablePage.sortDesc"
                             :all-page="tablePage.allPage"
                             :this-page.sync="tablePage.thisPage"
                             :select-index.sync="selectIndex"
                             :page-size.sync="tablePage.pageSize"
                             :setting-visible="false"
                             @rowLeftClick="onSelect"
                             @changePageSize="getMembers"
                             @changeSort="getMembers"
                             @changePageNumber="getMembers"
                             @clickRefresh="getMembers"
            >
                <template slot="toolbox-left">
                    <p-search :search-placeholder="getSearchPlaceHolder"
                              :search-text.sync="searchText"
                              @onSearch="search"
                    />
                </template>
                <template v-slot:col-user_id-format="data">
                    {{ data.item.user_id }}
                </template>
                <template v-slot:col-name-format="data">
                    {{ data.item.name }}
                </template>
                <template v-slot:col-email-format="data">
                    {{ data.item.email }}
                </template>
            </p-toolbox-table>
            <p-box-layout class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       class="tag"
                       @delete="tagTools.deleteTag(idx)"
                >
                    {{ tag }}
                </p-tag>
            </p-box-layout>
            <div class="label-group">
                <div class="form-group">
                    <p-label class="input-title">
                        {{ tr('COMMON.LABELS') }}
                    </p-label>
                    <p-text-input ref="labels" v-model="label.input"
                                  :style="{'border': `${getInvalidityHashTag}`, 'boxShadow': 'none' } "
                                  class="form-control"
                                  type="text"
                                  placeholder="  #Labels,"
                                  required
                                  @keyup="removeCSS"
                    />
                </div>
                <div v-show="isValidHashTag" style="display:block" class="invalid-feedback">
                    * {{ tr('IDENTITY.CHECK_HASH') }}
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ tr('COMMON.BTN_ADD') }}
        </template>
    </p-button-modal>
</template>
<script>
import _ from 'lodash';
import { defaultQuery } from '@/lib/api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PLabel from '@/components/atoms/labels/Label.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';

export default {
    name: 'ProjectMemberAdd',
    events: ['close'],
    components: {
        PButtonModal,
        PToolboxTable,
        PTextInput,
        PSearch,
        PLabel,
        PTag,
        PBoxLayout,
    },
    props: {
        referenceMember: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            visible: false,
            users: [],
            searchText: null,
            selectable: true,
            sortable: true,
            selectIndex: [],
            label: {
                input: '',
                hashTagInvalidity: false,
                border: '1px solid #EF3817',
            },
            tablePage: {
                sortBy: 'name',
                sortDesc: true,
                thisPage: 1,
                allPage: 1,
                pageSize: 15,
            },
            tagTools: tagList(),
        };
    },
    computed: {
        getInvalidityHashTag() {
            return this.label.hashTagInvalidity ? this.label.border : '';
        },
        isValidHashTag() {
            return this.label.hashTagInvalidity;
        },
        getMemberModalTitle() {
            return this.tr('IDENTITY.ADD_ARG', [this.tr('COMMON.MEMBER')]);
        },
        getSearchPlaceHolder() {
            return this.tr('IDENTITY.SCH_PAC_DT');
        },
        selectedFields() {
            return [
                {
                    name: 'user_id', label: this.tr('COMMON.UID'),
                },
                {
                    name: 'name', label: this.tr('COMMON.NAME'),
                },
                {
                    name: 'email', label: this.tr('COMMON.EMAIL'),
                },
            ];
        },
    },
    methods: {
        removeCSS() {
            this.label.hashTagInvalidity = false;
        },
        getDefaultQuery() {
            return {
                query: defaultQuery(
                    this.tablePage.thisPage,
                    this.tablePage.pageSize,
                    this.tablePage.sortBy,
                    this.tablePage.sortDesc,
                ),
            };
        },
        changePageSize() {
            this.tablePage.thisPage = 1;
            this.tablePage.allPage = 1;
            this.listMembers();
        },
        getMembers() {
            this.listMembersOnSearch();
        },
        showModal() {
            this.visible = true;
            this.resetToBlank();
            this.listMembersOnSearch('x', true);
        },
        hideModal() {
            this.visible = false;
        },
        resetToBlank() {
            this.label.input = '';
            this.searchText = null;
            this.users = [];
            this.tablePage = {
                sortBy: 'name',
                sortDesc: true,
                thisPage: 1,
                allPage: 1,
                pageSize: 15,
            };
        },
        async listMembersOnSearch(text, first) {
            const query = {
                keyword: this.isEmpty(text) ? this.searchText : text,
                filter: [
                    { key: 'user_id', value: this.referenceMember, operator: 'not_in' },
                ],
                ...this.getDefaultQuery(),
            };

            if (first) {
                delete query.keyword;
            }

            await this.$http.post('/identity/user/list', { query }).then((response) => {
                this.users = response.data.results;
                const allPage = Math.ceil(response.data.total_count / this.tablePage.pageSize);
                this.tablePage.allPage = allPage || 1;
                this.selectIndex = [];
            }).catch((error) => {
                console.error(error);
            });
        },
        checkValidity() {
            const targets = this.label.input.split(',');
            const labelArr = [];
            targets.forEach((value) => {
                const current = this.replaceAll(value, ' ', '');
                if (current.startsWith('#')) {
                    labelArr.push(current);
                } else {
                    this.label.hashTagInvalidity = true;
                }
            });
            return this.label.hashTagInvalidity ? false : labelArr;
        },
        async addUserOnProject() {
            const selectedNodeDT = this.$parent.selectedNode.node.data;
            // eslint-disable-next-line camelcase
            const selectedId = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-').toLowerCase()}/member/add`;
            const param = { users: this.tagTools.tags, ...selectedId };

            if (!this.isEmpty(this.label.input)) {
                const isValid = this.checkValidity();
                if (isValid === false) {
                    return;
                }
                param.labels = isValid;
            } else if (this.isEmpty(param.users)) {
                return;
            }

            await this.$http.post(url, param).then(() => {
                this.$parent.getMembers();
                // this.tagRelated.Tags = [];
                this.tagTools.tags = [];
                this.hideModal();
            }).catch((error) => {
                console.error(error);
            });
        },
        onSelect(item) {
            this.tagTools.addTag(item.user_id);
        },
        search() {
            this.listMembersOnSearch(this.searchText);
        },
        confirm() {
            this.addUserOnProject();
        },
        close() {
            console.debug('close Modal');
        },
    },
};
</script>
<style lang="scss" scoped>
    .tag-container {
        min-height: 80px;
    }
    .tag {
        margin-bottom: .5rem;
    }
    .label-group {
        margin-bottom: 0rem;
    }
    .input-title{
        margin-top: 0.5rem;
        text-align: left;
        font: Bold 14px/28px Arial;
        letter-spacing: 0;
        color: #222532;
        opacity: 1;
    }
</style>
