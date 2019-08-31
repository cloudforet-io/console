<template>
  <div>
    <BaseModal ref="BAMO003_ActionCheckModal"
               :title="modalTitle"
               :type="type"
               :centered="centered"
               @ok="onOk"
    >
      <template #contents>
        <h4>{{ modalText }}</h4>
        <br>
        <BaseTable :table-data="data" 
                   :fields="fields"
                   :selectable="false"
                   cardless
                   headerless
                   underlined
        />
      </template>
    </BaseModal>

    <BaseModal ref="BAMO003_ActionResultModal"
               :title="tr('ACTION.TITLE_FAILED')"
               type="danger"
               :centered="centered"
               ok-only
               @ok="hideResultModal"
    >
      <template #contents>
        <h4>{{ tr('ACTION.FAILED') }}</h4>
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
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
import BaseTable from '@/components/base/table/BATB_001_BaseTable';

export default {
    name: 'ActionCheckModal',
    event: ['commit', 'failed', 'succeed'],
    components: {
        BaseModal,
        BaseTable
    },
    props: {
        title: {
            type: String,
            default: null
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
            default: null
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
            default: null
        },
        successMessage: {
            type: String,
            default: null
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
            failedItemList: [],
            modalTitle: this.title || this.tr('ACTION.TITLE_DEFAULT'),
            modalText: this.text || this.tr('ACTION.CHECK_DEFAULT'),
            modalFailMsg: this.failMessage || this.tr('ACTION.ERROR'),
            modalsuccessMsg: this.successMessage || this.tr('ACTION.SUCCESS')
        };
    },
    computed: {
        failedItemFields () {
            return [
                { key: this.primaryKey, label: this.primaryKey },
                { key: 'reason', label: this.tr('COL_NM.FAIL_REASON') }
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
            if (this.action) {
                if (this.runAsSync) {
                    this.doActionSync();
                } else {
                    this.doAction();
                    this.hideModal();
                }
            } else {
                this.$emit('commit');
                this.hideModal();
            }
        },
        doAction () {
            this.action(this.data);  
        },
        async doActionSync () {
            try {
                await this.action(this.data);
                this.hideModal();
                this.$alertify.success(this.modalsuccessMsg);
                this.$emit('succeed');
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.modalFailMsg);
                if (this.showFailResult) {
                    this.hideModal();
                    if (e.data.error.fail_items) {
                        this.setFailList(e.data.error.fail_items);
                        this.showResultModal();
                    }
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
            this.$emit('failed');
        },
        reset () {
            this.failedItemList = [];
        }
    }
};
</script>

<style lang="scss" scoped>

</style>