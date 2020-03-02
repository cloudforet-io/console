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
                <div v-if="getVisible" class="mb-4">
                    <p-label class="input-title">
                        {{ getLabelID }}
                    </p-label>
                    <p-text-input v-show="getShowHideYN"
                                  ref="parentsDataCenterName"
                                  v-model="textInput.parentName"
                                  :style="{'boxShadow': 'none'} "
                                  :disabled="true"
                                  class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm w-1/2"
                                  type="text"
                                  required
                    />
                    <p-text-input v-show="!getShowHideYN"
                                  ref="dataCenterID"
                                  v-model="textInput.id"
                                  :style="{'boxShadow': 'none' } "
                                  :disabled="true"
                                  class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm w-1/2"
                                  type="text"
                                  placeholder="  Project ID"
                                  required
                    />
                </div>
                <div class="mb-4">
                    <p-label class="input-title">
                        {{ getLabelName }}
                    </p-label>
                    <p-text-input ref="dataCenterName" v-model="textInput.name"
                                  v-focus
                                  :style="{'border': `${getIsInvalidProjectName}`, 'boxShadow': 'none' } "
                                  class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                  :placeholder="getPlaceHolderName"
                                  @keyup="removeMessage"
                    />
                    <div v-show="isValid.valid" style="display:block" class="invalid-feedback">
                        * {{ isValid.errorMessage }}
                    </div>
                </div>
            </form>
            <div class="input-title">
                {{$t('COMMON.TAG') }}
            </div>
            <div class="input-tag-card">
                <p-dict-input-group ref="tagPanel"
                                    :use-full-col="true"
                                    :tag-key-placeholder="'key'"
                                    :tag-value-placeholder="'value'"
                                    :edit-mode="tagInput.editMode"
                                    :dict.sync="tagInput.tags"
                />
            </div>
        </template>
        <template #close-button>
            {{$t('BTN.CANCEL') }}
        </template>
        <template #confirm-button>
            {{$t('BTN.OK') }}
        </template>
    </p-button-modal>
</template>
<script>
import _ from 'lodash';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PLabel from '@/components/atoms/labels/Label';
import PTextInput from '@/components/atoms/inputs/TextInput';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup';

export default {
    name: 'DataCenterContextAction',
    components: {
        PButtonModal,
        PLabel,
        PTextInput,
        PDictInputGroup,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
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
            getShowHideYN: true,
            visible: false,
            projectNameValidity: false,
            isValid: {
                valid: false,
                errorMessage: null,
            },
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
                parentName: null,
                id: null,
                name: null,
            },
        };
    },
    computed: {
        getVisible() {
            let visible = true;
            if (!this.isEmpty(this.actionFlag) && this.actionFlag === 'CRT_RE') {
                visible = false;
            }
            return visible;
        },
        getPlaceHolderName() {
            let msg = 'INVENTORY.REGION_NM';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(this.actionFlag)) {
                if (actionFlag[1] === 'ZN') {
                    msg = 'INVENTORY.ZONE_NM';
                } else if (actionFlag[1] === 'PL') {
                    msg = 'INVENTORY.POOL_NM';
                }
            }
            return this.$t(msg);
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
                const targetObj = actionFlag[1] === 'RE' ? this.$t('COMMON.REGION') : actionFlag[1] === 'ZN' ? this.$t('COMMON.ZONE') : this.$t('COMMON.POOL');
                if (actionFlag[0] === 'CRT') {
                    selectedLabel = this.$t('ORGANISMS.CREATE_ARG', [targetObj]);
                } else if (actionFlag[0] === 'UPT') {
                    selectedLabel = this.$t('ORGANISMS.UPDATE_ARG', [targetObj]);
                } else {
                    selectedLabel = this.$t('ORGANISMS.DELETE_ARG', [targetObj]);
                }
            }
            return selectedLabel;
        },
        getLabelID() {
            let selectedLabel = '';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag)) {
                const targetObj = actionFlag[1] === 'RE' ? this.$t('COMMON.REGION') : actionFlag[1] === 'ZN' ? this.$t('COMMON.ZONE') : this.$t('COMMON.POOL');
                if (actionFlag[0] === 'CRT') {
                    if (actionFlag[1] === 'ZN') {
                        selectedLabel = this.$t('INVENTORY.PARENT_ARG', [this.$t('COMMON.REGION')]);
                    } else if (actionFlag[1] === 'PL') {
                        selectedLabel = this.$t('INVENTORY.PARENT_ARG', [this.$t('COMMON.ZONE')]);
                    } else {
                        selectedLabel = this.$t('INVENTORY.PARENT_ARG', [this.$t('COMMON.POOL')]);
                    }
                } else if (actionFlag[0] === 'UPT') {
                    selectedLabel = this.$t('INVENTORY.SELECT_ARG', [targetObj]);
                } else {
                    selectedLabel = this.$t('ORGANISMS.DELETE_ARG', [targetObj]);
                }
            }
            return selectedLabel;
        },
        getLabelName() {
            let selectedLabel = '';
            const actionFlag = this.getSplitActionFlag();
            if (!this.isEmpty(actionFlag)) {
                selectedLabel = actionFlag[1] === 'RE' ? this.$t('INVENTORY.REGION_NM') : actionFlag[1] === 'ZN' ? this.$t('INVENTORY.ZONE_NM') : this.$t('INVENTORY.POOL_NM');
            }
            return selectedLabel;
        },
    },
    methods: {
        removeMessage() {
            this.isValid.valid = false;
        },
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
                this.isValid = {
                    valid: false,
                    errorMessage: null,
                };
                this.selectDataCenterMetas(reservedActionFlag);
            } else {
                this.deletedSelectedOnTree(reservedActionFlag, this.selectedNode.tree, this.selectedNode.node.data);
            }
        },
        hideModal() {
            this.cleanModal();
            this.visible = false;
        },
        async selectDataCenterMetas(reservedActionFlag) {
            const selectedNodeDT = this.selectedNode.node.data;
            const param = {};
            const url = `/inventory/${selectedNodeDT.item_type.toLowerCase()}/get`;
            const key = `${selectedNodeDT.item_type.toLowerCase()}_id`;
            param[key] = selectedNodeDT.id;

            await this.$http.post(url, param).then((response) => {
                const id = response.data[key];
                const parentName = _.get(response, 'data.name');
                let name = _.get(response, 'data.name');
                let tags = _.get(response, 'data.tags');
                if (reservedActionFlag[0] === 'CRT') {
                    this.getShowHideYN = true;
                    name = '';
                    tags = {};
                } else {
                    this.getShowHideYN = false;
                }

                this.textInput = { parentName, id, name };
                this.tagInput.tags = tags;
            }).catch((error) => {
                console.error(error);
            });
        },
        async createProjectAndGroup(flag, tree, nodeData) {
            this.$emit('create', flag, tree, nodeData);
        },
        async updateProjectAndGroup(flag, tree, nodeData) {
            const vm = this.textInput;
            if (!_.isEmpty(vm.name)) {
                this.$emit('update', flag, tree, nodeData);
            } else {
                this.isValid.valid = true;
                // eslint-disable-next-line no-nested-ternary
                const target = flag[1] === 'RE' ? this.$t('COMMON.REGION') : flag[1] === 'ZN' ? this.$t('COMMON.ZONE') : this.$t('COMMON.POOL');
                this.isValid.errorMessage = this.$t('INVENTORY.REQ_FIELD', [target]);
            }
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
            console.debug('close Modal');
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
        padding-top: 0.5rem;
        background-color: $primary4;
    }
</style>
