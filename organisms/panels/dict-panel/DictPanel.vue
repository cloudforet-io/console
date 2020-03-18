<template>
    <div>
        <p-panel-top>
            <template>{{ $t('WORD.TAGS') }}</template>
            <template #extra>
                <p-button v-if="!proxyEditMode" style-type="primary-dark"
                          @click="onClickEditMode"
                >
                    {{ $t('BTN.EDIT') }}
                </p-button>
                <div v-else class="extra-btns">
                    <p-button style-type="secondary" outline
                              :disabled="loading"
                              @click="onCancel"
                    >
                        {{ $t('BTN.CANCEL') }}
                    </p-button>
                    <p-loading-button :loading="loading"
                                      :disabled="enableValidation && !isValid"
                                      :button-bind="{styleType: 'secondary'}"
                                      @click="onSave"
                    >
                        {{ $t('BTN.SAVE') }}
                    </p-loading-button>
                </div>
            </template>
        </p-panel-top>
        <p-dict-input-group v-if="proxyEditMode"
                            ref="DIG"
                            :dict="dict"
                            :disabled="loading"
                            :enable-validation="enableValidation"
                            :show-empty-input="showEmptyInput"
                            @validate="onDictValidate"
        />
        <div v-else>
            <p-data-table v-bind="tableState" />
        </div>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    reactive, toRefs, getCurrentInstance, defineComponent, computed,
} from '@vue/composition-api';
import { DataTableState } from '@/components/organisms/tables/data-table/toolset';
import { makeTrItems } from '@/lib/view-helper';
import { getDictPanelProps, DictPanelPropsType } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';

import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLoadingButton from '@/components/molecules/buttons/LoadingButton.vue';
import { makeProxy } from '@/lib/compostion-util';

const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');

export default defineComponent({
    name: 'PDictPanel',
    components: {
        PPanelTop,
        PDictInputGroup,
        PButton,
        PLoadingButton,
        PDataTable,
    },
    props: getDictPanelProps(),
    setup(props: DictPanelPropsType, { emit }) {
        const vm: any = getCurrentInstance();

        const state: any = reactive({
            loading: false,
            proxyEditMode: makeProxy('editMode', props, emit),
            tableState: new DataTableState({
                fields: makeTrItems([
                    ['name', 'WORD.KEY'],
                    ['value', 'WORD.VALUE'],
                ], vm),
                items: computed(() => _.map(props.dict, (v, k) => ({ name: k, value: v }))),
                colCopy: true,
            }).state,
            newDict: props.dict,
            isValid: false,
            enableValidation: false,
            DIG: null,
        });

        const onClickEditMode = () => {
            state.proxyEditMode = true;
        };

        const onDictValidate = (isValid: boolean, newDict: object) => {
            state.isValid = isValid;
            if (isValid) state.newDict = newDict;
        };


        const reset = () => {
            state.enableValidation = false;
            state.newDict = props.dict;
            state.isValid = false;
        };

        const onCancel = () => {
            state.proxyEditMode = false;
            reset();
        };

        const onSave = async () => {
            if (!state.enableValidation) {
                state.enableValidation = true;
                if (!state.DIG || !state.DIG.validateAll()) return;
            }

            if (props.fetchApi) {
                try {
                    state.loading = true;
                    await props.fetchApi(state.newDict);
                    /**
                     * Notification
                     */
                } catch (e) {
                    console.error(e);
                    vm.$emit('fail', e);
                    return;
                } finally {
                    state.loading = false;
                }
            }
            vm.$emit('update:dict', state.newDict);
            vm.$emit('save', state.newDict);
            state.proxyEditMode = false;
            reset();
        };

        return {
            ...toRefs(state),
            onClickEditMode,
            onDictValidate,
            onCancel,
            onSave,
        };
    },

});
</script>

<style lang="postcss" scoped>
    .extra-btns {
        float: right;
        .btn {
            margin-left: .5rem;
        }
    }
</style>
