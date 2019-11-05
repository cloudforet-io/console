<template>
    <div>
        <BaseModal ref="BAMO003_ActionCheckModal"
                   :title="modalTitle"
                   :type="type"
                   :centered="centered"
                   @ok="onOk"
        >
            <template #contents>
                <div class="modal-contents">
                    <slot v-if="$scopedSlots.contents" name="contents" />
                    <template v-else>
                        <h4 class="modal-text">
                            {{ modalText }}
                        </h4>
                        <br>
                        <BaseTable :table-data="data"
                                   :fields="fields"
                                   :selectable="false"
                                   cardless
                                   headerless
                                   underlined
                        />
                    </template>
                </div>
            </template>

            <template v-if="$scopedSlots.footer" #footer="{ ok, hide, cancel }">
                <slot name="footer"
                      :ok="onOk" :hide="hide" :cancel="cancel"
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
import BaseTable from '@/components/base/table/BaseTable';

const BaseModal = () => import('@/components/base/modal/BaseModal');

export default {
    name: 'ActionCheckModal',
    events: ['commit', 'failed', 'succeed'],
    components: {
        BaseModal,
        BaseTable,
    },
    props: {
        title: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            default: 'danger',
        },
        centered: {
            type: Boolean,
            default: true,
        },
        text: {
            type: String,
            default: null,
        },
        data: {
            type: Array,
            default: () => [],
            required: true,
        },
        fields: {
            type: Array,
            default: () => [],
            required: true,
        },
        action: {
            type: Function,
            default: null,
        },
        /**
         * It works only when action property is defined.
         */
        runAsSync: {
            type: Boolean,
            default: true,
        },
        /**
         * It works only when runAsSync property is true.
         */
        showFailResult: {
            type: Boolean,
            default: true,
        },
        failMessage: {
            type: String,
            default: null,
        },
        successMessage: {
            type: String,
            default: null,
        },
        /**
         * It is used when getting failed items.
         */
        primaryKey: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            failedItemList: [],
        };
    },
    computed: {
        failedItemFields() {
            return [
                { key: this.primaryKey, label: this.primaryKey },
                { key: 'reason', label: this.tr('COL_NM.FAIL_REASON') },
            ];
        },
        modalTitle() {
            return this.title || this.tr('ACTION.TITLE_DEFAULT');
        },
        modalText() {
            return this.text || this.tr('ACTION.CHECK_DEFAULT');
        },
        modalFailMsg() {
            return this.failMessage || this.tr('ACTION.ERROR');
        },
        modalSuccessMsg() {
            return this.successMessage || this.tr('ACTION.SUCCESS');
        },
    },
    created() {
        if (this.showFailResult && this.isEmpty(this.primaryKey)) {
            throw new Error('The required property was not provided.\n\
             \'primaryKey\' property is required when the property \'showFailResult\' is true.');
        }
    },
    methods: {
        onOk() {
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
        doAction() {
            this.action(this.data);
        },
        async doActionSync() {
            try {
                const res = await this.action(this.data);
                if (res && res.stop) {
                    return;
                }
                this.hideModal();
                this.$alertify.success(this.modalSuccessMsg);
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
        setFailList(items) {
            if (items) {
                this._.forIn(items, (value, key) => {
                    this.failedItemList.push({
                        [this.primaryKey]: key,
                        reason: value,
                    });
                });
            }
        },
        showModal() {
            this.$refs.BAMO003_ActionCheckModal.showModal();
        },
        hideModal() {
            this.$refs.BAMO003_ActionCheckModal.hideModal();
        },
        showResultModal() {
            this.$refs.BAMO003_ActionResultModal.showModal();
        },
        hideResultModal() {
            this.$refs.BAMO003_ActionResultModal.hideModal();
            this.$emit('failed');
        },
        reset() {
            this.failedItemList = [];
        },
    },
};
</script>

<style lang="scss" scoped>
.modal-contents {
    height: 400px;
    .modal-text {
        padding: 15px 20px;
    }
}
</style>
