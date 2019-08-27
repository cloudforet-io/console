<template>
  <div>
    <BaseModal ref="BAMO003_ActionCheckModal"
               :title="title"
               :type="type"
               :centered="centered"
               @ok="onOk"
    >
      <template #contents>
        <h4>{{ text }}</h4>
        <br>
        <BaseTable :table-data="data" 
                   :fields="fields"
                   field-id="user_id"
                   cardless
                   headerless
                   underlined
        >
          <!-- <template :slot="`HEAD_selected`" { field }> -->
          <!-- <BaseCheckbox key="_selected"
                          v-model="isSelectedAll"
                          class="select-checkbox"
                          :type="type"
            /> -->
          <!-- </template> -->
        </BaseTable>
      </template>
    </BaseModal>

    <BaseModal ref="BAMO003_ActionResultModal"
               title="Action Failed"
               type="danger"
               :centered="centered"
               ok-only
               @ok="hideResultModal"
    >
      <template #contents>
        <h4>Failed to excute the requested action for items below: </h4>
        <br>
        <div>
          <BaseTable :table-data="failedItemList" 
                     :fields="failedItemFields" 
                     :selectable="false"
                     cardless
                     headerless
                     underlined
          />
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
const BaseCheckbox = () => import('@/components/base/checkbox/BACB_001_BaseCheckbox');
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
import BaseTable from '@/components/base/table/BATB_001_BaseTable';

export default {
    name: 'ActionCheckModal',
    event: ['commit', 'close', 'success'],
    components: {
        BaseModal,
        BaseTable,
        BaseCheckbox
    },
    props: {
        title: {
            type: String,
            default: 'Action Check'
        },
        type: {
            type: String,
            default: 'danger'
        },
        centered: {
            type: Boolean,
            default: true
        },
        text: {
            type: String,
            default: 'Are you sure you want to delete selected item(s) below?'
        },
        data: {
            type: Array,
            default: () => [],
            required: true
        },
        fields: {
            type: Array,
            default: () => [],
            required: true
        },
        checkable: {
            type: Boolean,
            default: false
        },
        action: {
            type: Function,
            default: null
        },
        /**
         * It works only when action property is defined. 
         */
        runAsSync: { 
            type: Boolean,
            default: true
        },
        /**
         * It works only when runAsSync property is true. 
         */
        showFailResult: {
            type: Boolean,
            default: true
        },
        failMessage: {
            type: String,
            default: 'ERROR OCCURED'
        },
        successMessage: {
            type: String,
            default: 'Succeed'
        },
        /**
         * It is used when getting failed items. 
         */
        primaryKey: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            commitItems: [],
            failedItemList: []
        };
    },
    computed: {
        items () {
            return this.data.map((item) => {
                if (this.checkable) {
                    item.selected = true;
                }
                return item;
            });
        },
        failedItemFields () {
            return [
                { key: this.primaryKey, label: this.primaryKey },
                { key: 'reason', label: 'Reason for Failure' }
            ];
        }
    },
    created() {
        if (this.showFailResult && this.isEmpty(this.primaryKey)) {
            throw new Error('The required property was not provided.\n\
             \'primaryKey\' property is required when the property \'showFailResult\' is true.');
        }
    },
    methods: {
        onOk () {
            this.setCommitItems();
            if (this.action) {
                if (this.runAsSync) {
                    this.doActionSync();
                } else {
                    this.doAction();
                    this.hideModal();
                }
            } else {
                this.$emit('commit', this.commitItems);
                this.hideModal();
            }
        },
        doAction () {
            this.action(this.commitItems);  
        },
        async doActionSync () {
            try {
                await this.action(this.commitItems);
                this.hideModal();
                this.$alertify.success(this.successMessage);
                this.$emit('success');
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.failMessage);
                if (this.showFailResult) {
                    this.hideModal();
                    this.setFailList(e.data.error.fail_items);
                    this.showResultModal();
                }
            }
        },
        setFailList (items) {
            if (items) {
                this._.forIn(items, (value, key) => {
                    this.failedItemList.push({
                        [this.primaryKey]: key,
                        reason: value
                    });
                });
            }
        },
        showModal () {
            this.$refs.BAMO003_ActionCheckModal.showModal();
        },
        hideModal () {
            this.$refs.BAMO003_ActionCheckModal.hideModal();
        },
        showResultModal () {
            this.$refs.BAMO003_ActionResultModal.showModal();
        },
        hideResultModal () {
            this.$refs.BAMO003_ActionResultModal.hideModal();
            this.$emit('close');
        },
        setCommitItems () {
            this.items.map((item) => {
                if (item.selected) {
                    this.commitItems.push(item);
                }
            });
        },
        reset () {
            this.commitItems = [];
            this.failedItemList = [];
        }
    }
};
</script>

<style lang="scss" scoped>

</style>