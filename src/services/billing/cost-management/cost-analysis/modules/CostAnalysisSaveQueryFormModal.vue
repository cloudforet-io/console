<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_QUERY_NAME')"
                           :invalid="!isQueryNameValid"
                           :invalid-text="queryNameInvalidText"
                           required
            >
                <template #default>
                    <p-text-input v-model="formState.queryName" class="block w-full" :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MY_QUERY')"
                                  :invalid="!isQueryNameValid" @input.once="handleFirstQueryNameInput"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="!(requestType === REQUEST_TYPE.SAVE)" :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_VISIBILITY')" required>
                <div class="visibility-radio-list">
                    <p-radio v-for="visibility in visibilityList" :key="visibility.value"
                             v-model="formState.selectedVisibility"
                             :value="visibility.value"
                             @change="handleChangeVisibility(visibility.value)"
                    >
                        <div class="visibility-radio-content-wrapper">
                            <template>
                                <p-i v-if="visibility.value === QUERY_VISIBILITY_TYPE.PRIVATE" name="ic_private"
                                     height="1.3rem"
                                />
                            </template>
                            <span>{{ visibility.label }}</span>
                        </div>
                    </p-radio>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadio, PI,
} from '@spaceone/design-system';
import {
    CostQuerySetModel,
    QUERY_VISIBILITY_TYPE,
    REQUEST_TYPE,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { i18n } from '@/translations';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    listCostQuerySet: () => void;
    visible: boolean;
    headerTitle: string;
    selectedQuery: CostQuerySetModel;
    requestType: REQUEST_TYPE;
}

export default {
    name: 'CostAnalysisSaveQueryFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
        PRadio,
        PI,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: '',
        },
        selectedQuery: {
            type: Object,
            default: undefined,
        },
        requestType: {
            type: String,
            default: REQUEST_TYPE.SAVE,
            validator(type: REQUEST_TYPE) {
                return Object.values(REQUEST_TYPE).includes(type);
            },
        },
        listCostQuerySet: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const formState = reactive({
            queryName: undefined as undefined | string,
            selectedVisibility: QUERY_VISIBILITY_TYPE.PRIVATE,
        });
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            visibilityList: computed(() => ([
                { value: QUERY_VISIBILITY_TYPE.PUBLIC, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PUBLIC') },
                { value: QUERY_VISIBILITY_TYPE.PRIVATE, label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PRIVATE') },
            ])),
            queryNameInvalidText: computed(() => {
                if (typeof formState.queryName === 'undefined') return undefined;
                if (formState.queryName.length === 0) {
                    return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_REQUIRED');
                }
                if (formState.queryName.length > 40) {
                    return i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MODAL_VALIDATION_LENGTH');
                }
                return undefined;
            }),
            isQueryNameValid: computed(() => !state.queryNameInvalidText),
            showValidation: false,
            isAllValid: computed(() => state.showValidation && state.isQueryNameValid),
        });

        watch(() => state.proxyVisible, (after) => {
            if (!after) {
                formState.queryName = undefined;
                formState.selectedVisibility = QUERY_VISIBILITY_TYPE.PRIVATE;
                state.showValidation = false;
            } else if (props.requestType === REQUEST_TYPE.EDIT) formState.selectedVisibility = props.selectedQuery.scope;
        });

        watch(() => props.selectedQuery.name, (after) => {
            if (after) {
                formState.queryName = after;
                state.showValidation = true;
            }
        });

        const saveQuery = async () => {
            try {
                await SpaceConnector.client.costAnalysis.costQuerySet.create({
                    name: formState.queryName,
                    options: {},
                });
                await props.listCostQuerySet();
                showSuccessMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleError(e);
                showErrorMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'), e);
            }
        };

        const editQuery = async () => {
            try {
                if (props.selectedQuery?.name !== formState.queryName) {
                    await SpaceConnector.client.costAnalysis.costQuerySet.update({
                        cost_query_set_id: props.selectedQuery?.cost_query_set_id,
                        name: formState.queryName,
                    });
                }
                if (props.selectedQuery?.scope !== formState.selectedVisibility) {
                    await SpaceConnector.client.costAnalysis.costQuerySet.changeScope({
                        cost_query_set_id: props.selectedQuery?.cost_query_set_id,
                        scope: formState.selectedVisibility,
                    });
                }
                await props.listCostQuerySet();
                showSuccessMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_EDITED_QUERY'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleError(e);
                showErrorMessage(vm.$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_EDITED_QUERY'), e);
            }
        };

        const handleFormConfirm = async () => {
            if (!state.isAllValid) return;
            if (props.requestType === REQUEST_TYPE.SAVE) await saveQuery();
            else await editQuery();
            state.proxyVisible = false;
        };

        // event

        const handleChangeVisibility = (value) => {
            formState.selectedVisibility = value;
        };

        const handleFirstQueryNameInput = () => {
            state.showValidation = true;
        };

        return {
            ...toRefs(state),
            formState,
            handleFormConfirm,
            handleChangeVisibility,
            handleFirstQueryNameInput,
            QUERY_VISIBILITY_TYPE,
            REQUEST_TYPE,
        };
    },
};
</script>
<style lang="postcss" scoped>
.visibility-radio-list {
    @apply inline-flex justify-between;
    gap: 1rem;
}
.visibility-radio-content-wrapper {
    @apply inline-flex items-center;
    margin-left: 0.3rem;
}

.query-name-input-wrap {
    margin-bottom: 2rem;
}
</style>
