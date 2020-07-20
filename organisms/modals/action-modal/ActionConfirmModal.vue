<template>
    <p-button-modal
        ref="modal"
        :header-title="headerTitle"
        :scrollable="scrollable"
        :centered="centered"
        :size="size"
        :fade="fade"
        :backdrop="backdrop"
        :visible.sync="proxyVisible"
        :theme-color="themeColor"
        :footer-cancel-button-bind="footerCancelButtonBind"
        :footer-confirm-button-bind="footerConfirmButtonBind"

        @cancel="cancel"
        @close="close"
        @confirm="confirm"
    >
        <template #body>
            <div>
                <h4 class="p-table-check-modal-sub-title">
                    {{ subTitle }}
                </h4>
                <p-data-table :sortable="true" :items="sortedItems" :fields="fields"
                              :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                />
                <div v-if="doubleConfirm" style="width:100%">
                    <p-hr />
                    <p-row style="margin-top: 33px">
                        <p-col :col="12">
                            <PFieldGroup
                                :label="doubleConfirmTitle"
                                :invalid-text="invalidMsg.input"
                                :invalid="invalidState.input"
                                :valid="validState.input"
                                :required="true"
                            >
                                <template v-slot:default="{invalid}">
                                    <p-row style="width: 100%">
                                        <p-col :col="8">
                                            <p-text-input
                                                v-model="singleState.input"
                                                :placeholder="doubleConfirmPlaceHolder"
                                                :class="{
                                                    'is-invalid':invalid
                                                }"
                                            />
                                        </p-col>
                                    </p-row>
                                </template>
                            </PFieldGroup>
                        </p-col>
                    </p-row>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import { propsMixin } from '@/components/molecules/modals/Modal.vue';
import { setup as contentModalSetup } from '../content-modal/ContentModal.vue';
import {
    makeByPass, makeProxy, formValidation, requiredValidation, Validation,
} from '@/lib/compostion-util';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const originalInput = computed(() => props.doubleConfirmOrigin);

    const singleState = reactive({
        originInput: originalInput,
        input: '',
    });

    const sortState = reactive({
        sortBy: '',
        sortDesc: true,
    });
    const footerCancelButtonBind = reactive({
        styleType: 'gray900',
        outline: true,
    });
    const footerConfirmButtonBind = computed(() => ({
        styleType: props.themeColor === 'primary' ? 'primary-dark' : props.themeColor,
    }));

    const singleItemValidations = {
        input: [
            requiredValidation(),
            new Validation((value, data) => data.originInput === value, 'Please enter same value again'),
        ],
    };

    const validateAPI = formValidation(singleState, singleItemValidations);

    const confirm = async () => {
        if (props.doubleConfirm) {
            const result = await validateAPI.allValidation();
            if (result) {
                context.emit('confirm', props.items);
            }
        } else {
            context.emit('confirm', props.items);
        }
    };

    return {
        ...state,
        ...toRefs(sortState),
        footerCancelButtonBind,
        footerConfirmButtonBind,
        singleState,
        ...validateAPI,
        sortedItems: computed(() => {
            // todo: move this feather to p-data-table
            if (sortState.sortBy) {
                return _.orderBy(props.items, sortState.sortBy, sortState.sortDesc ? 'desc' : 'asc');
            }
            return props.items;
        }),
        proxyVisible: makeProxy('visible', props, context.emit),
        cancel: makeByPass(context.emit, 'cancel'),
        close: makeByPass(context.emit, 'close'),
        confirm,
    };
};

export default {
    name: 'PTableCheckModal',
    components: {
        PButtonModal, PDataTable, PRow, PCol, PTextInput, PHr, PFieldGroup,
    },
    mixins: [propsMixin],
    props: {
        themeColor: {
            type: String,
            default: 'primary',
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        doubleConfirm: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default: () => ({
                originInput: '',
                input: '',
            }),
        },
        doubleConfirmOrigin: String,
        doubleConfirmTitle: String,
        doubleConfirmPlaceHolder: String,
        headerTitle: String,
        subTitle: String,
        fields: Array,
        items: Array,
        responsiveStyle: {
            type: Object,
            default: () => ({ 'max-height': '100px', 'overflow-y': 'auto', 'overflow-x': 'auto' }),

        },
    },
    setup(props, context) {
        return setup(props, context);
    },


};
</script>

<style lang="postcss" scoped>
    .p-table-check-modal-sub-title{
        margin-bottom: 2rem;
    }
</style>
