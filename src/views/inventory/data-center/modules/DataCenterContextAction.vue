<template>
    <p-button-modal
        ref="modal"
        :scrollable="true"
        :centered="true"
        :fade="true"
        :backdrop="true"
        :size="getSizer"
        :theme-color="getModalTheme"
        :header-title="getAppropriateModalTitle"
        :visible.sync="visible"
        @close="close"
        @confirm="confirm"
    >
        <template #body>
            <form class="form-binder novalidate">
                <div v-if="getVisible" class="form-group">
                    <p-label class="input-title">
                        {{ getLabelID }}
                    </p-label>
                    <p-text-input ref="projectID" v-model="textInput.id"
                                  :style="{'boxShadow': 'none' } "
                                  :disabled="true"
                                  class="form-control"
                                  type="text"
                                  placeholder="  Project ID"
                                  required
                    />
                </div>
                <div class="form-group">
                    <p-label class="input-title">
                        {{ getLabelName }}
                    </p-label>
                    <p-text-input ref="projectName" v-model="textInput.name"
                                  :style="{'border': `${getIsInvalidProjectName}`, 'boxShadow': 'none' } "
                                  class="form-control"
                                  placeholder="  Project Name"
                                  required
                    />
                    <div v-show="false" style="display:block" class="invalid-feedback">
                        * {{ $t('SIGNIN.PASS_EMPTY') }}
                    </div>
                </div>
            </form>
            <div class="input-title">
                {{ tr('COMMON.TAG') }}
            </div>
            <div class="input-tag-card">
                <div>
                    <p-tag-input-group ref="tagPanel"
                                       :use-full-col="true"
                                       :tag-key-placeholder="'key'"
                                       :tag-value-placeholder="'value'"
                                       :edit-mode="tagInput.editMode"
                                       :tags.sync="tagInput.tags"
                    />
                </div>
            </div>
        </template>
        <template #close-button>
            {{ tr('COMMON.BTN_CANCEL') }}
        </template>
        <template #confirm-button>
            {{ tr('COMMON.BTN_OK') }}
        </template>
    </p-button-modal>
</template>
<script>
import _ from 'lodash';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PLabel from '@/components/atoms/labels/Label';
import PTextInput from '@/components/atoms/inputs/TextInput';
import PTagInputGroup from '@/components/organisms/forms/tag-input-group/TagInputGroup';

export default {
    name: 'DataCenterContextAction',
    components: {
        PButtonModal,
        PLabel,
        PTextInput,
        PTagInputGroup,
    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
        },
        actionFlag: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            visible: false,
            projectNameValidity: false,
            styler: {
                border: '1px solid #EF3817',
            },
            necParam: {
                tree: null,
                nodeData: null,
            },
            tagInput: {
                tags: {

                },
                editMode: true,
            },
            textInput: {
                id: null,
                name: null,
            },
        };
    },
    computed: {
        getVisible() {
            let visible = true;
            if (!this.isEmpty(this.actionFlag) && this.actionFlag === 'CRT_RT') {
                visible = false;
            }
            return visible;
        },
        getIsInvalidProjectName() {
            return this.projectNameValidity ? this.styler.border : '';
        },
        getSizer() {
            let size = 'md';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag) && actionFlag[0] === 'DEL') {
                size = 'xl';
            }
            return size;
        },
        getModalTheme() {
            let theme = 'primary';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag) && actionFlag[0] === 'DEL') {
                theme = 'alert';
            }
            return theme;
        },
        getAppropriateModalTitle() {
            let selectedLabel = '';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag)) {
                const targetObj = actionFlag[1] === 'RE' ? this.tr('COMMON.REGION') : actionFlag[1] === 'ZN' ? this.tr('COMMON.ZONE') : this.tr('COMMON.POOL');
                if (actionFlag[0] === 'CRT') {
                    selectedLabel = this.tr('ORGANISMS.CREATE_ARG', [targetObj]);
                } else if (actionFlag[0] === 'UPT') {
                    selectedLabel = this.tr('ORGANISMS.UPDATE_ARG', [targetObj]);
                } else {
                    selectedLabel = this.tr('ORGANISMS.DELETE_ARG', [targetObj]);
                }
            }
            return selectedLabel;
        },
        getLabelID() {
            let selectedLabel = '';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag)) {
                const targetObj = actionFlag[1] === 'RE' ? this.tr('COMMON.REGION') : actionFlag[1] === 'ZN' ? this.tr('COMMON.ZONE') : this.tr('COMMON.POOL');
                if (actionFlag[0] === 'CRT') {
                    if (actionFlag[0] === 'CRT') {

                    }
                    selectedLabel = this.tr('INVENTORY.PARENT_ARG', [this.tr('COMMON.PG_GR')]);
                } else if (actionFlag[0] === 'UPT') {
                    selectedLabel = this.tr('INVENTORY.SELECT_ARG', [targetObj]);
                } else {
                    selectedLabel = this.tr('ORGANISMS.DELETE_ARG', [targetObj]);
                }
            }
            return selectedLabel;
        },
        getLabelName() {
            let selectedLabel = '';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag)) {
                selectedLabel = actionFlag[1] === 'PJ' ? this.tr('COMMON.PG_NM') : this.tr('COMMON.PG_GR_NM');
            }
            return selectedLabel;
        },
    },
    methods: {
        cleanModal() {
            this.tagInput = {
                tags: {},
                editMode: true,
            };
            this.textInput = { id: null, name: null };
        },
        showModal(actionFlag) {
            const reservedActionFlag = actionFlag.split('_');
            if (!this.isEmpty(reservedActionFlag) && reservedActionFlag[0] !== 'DEL') {
                this.visible = true;
                this.selectProjectMetas(reservedActionFlag);
            } else {
                this.deletedSelectedOnTree(reservedActionFlag, this.selectedNode.tree, this.selectedNode.node.data);
            }
        },
        hideModal() {
            this.cleanModal();
            this.visible = false;
        },
        async selectProjectMetas(reservedActionFlag) {
            const selectedNodeDT = this.selectedNode.node.data;
            const param = selectedNodeDT.item_type === 'PROJECT_GROUP' ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/get`;

            await this.$http.post(url, param).then((response) => {
                const id = this.isEmpty(_.get(response, 'data.project_group_id')) ? _.get(response, 'data.project_id') : _.get(response, 'data.project_group_id');
                let name = _.get(response, 'data.name');
                let tags = _.get(response, 'data.tags');

                if (reservedActionFlag[0] === 'CRT') {
                    name = '';
                    tags = {};
                }

                this.textInput = { id, name };
                this.tagInput.tags = tags;
            }).catch((error) => {
                console.error(error);
            });
        },
        async createProjectAndGroup(flag, tree, nodeData) {
            this.$emit('create', flag, tree, nodeData);
        },
        async updateProjectAndGroup(flag, tree, nodeData) {
            this.$emit('update', flag, tree, nodeData);
        },
        async deletedSelectedOnTree(flag, tree, nodeData) {
            this.$emit('delete', flag, tree, nodeData);
        },
        getSplitActionFlag() {
            let actionFlag = [];
            if (!this.isEmpty(this.actionFlag)) {
                actionFlag = this.actionFlag.split('_');
            }
            return actionFlag;
        },
        confirm() {
            const actionFlag = this.getSplitActionFlag();
            const treeV = this.selectedNode.tree;
            const selectedNodeDT = this.selectedNode.node.data;
            if (actionFlag[0] === 'CRT') {
                this.createProjectAndGroup(actionFlag, treeV, selectedNodeDT);
            } else {
                this.updateProjectAndGroup(actionFlag, treeV, selectedNodeDT);
            }
        },
        close() {
            console.log('close Modal');
        },
    },
};
</script>

<style lang="scss" scoped>
    .base-table {
        @extend %sheet;
    }
    .btn-margin{
        margin-left: 1rem;
    }

    .input-title{
        margin-bottom: 0px;
        text-align: left;
        font: Bold 14px/28px Arial;
        letter-spacing: 0;
        color: #222532;
        opacity: 1;
    }

    .input-tag-card{
        background: #F8F8FC 0% 0% no-repeat padding-box !important;
        border: 1px solid #F2F2F2 !important;
        opacity: 1;
     > div {
         margin-top: 8px;
         height: 15vh;
         max-height: 20vh;
         overflow-y: auto;
     }
    }
</style>
