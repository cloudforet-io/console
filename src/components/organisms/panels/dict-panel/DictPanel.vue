<template>
    <div>
        <p-panel-top>
            <template>{{ $t('WORD.TAGS') }}</template>
            <template #extra>
                <p-button v-if="!editMode" style-type="primary-dark"
                          @click="editMode = true"
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
        <p-dict-input-group v-if="editMode"
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
import {
    reactive, toRefs, getCurrentInstance, defineComponent, computed,
} from '@vue/composition-api';
import { DataTableState } from '@/components/organisms/tables/data-table/toolset';
import { makeTrItems } from '@/lib/view-helper';
import { dictToArray } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import { getDictPanelProps, DictPanelPropsType } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';

import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLoadingButton from '@/components/molecules/buttons/LoadingButton.vue';

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
    setup(props: DictPanelPropsType) {
        const vm: any = getCurrentInstance();

        const state: any = reactive({
            loading: false,
            editMode: false,
            tableState: new DataTableState({
                fields: makeTrItems([
                    ['key', 'WORD.KEY'],
                    ['value', 'WORD.VALUE'],
                ], vm),
                items: computed(() => dictToArray(props.dict, vm)),
                colCopy: true,
            }).state,
            newDict: props.dict,
            isValid: false,
            enableValidation: false,
            DIG: null,
        });

        const onDictValidate = (isValid: boolean, newDict: object) => {
            state.isValid = isValid;
            if (isValid) state.newDict = newDict;
        };

        const onCancel = () => {
            state.editMode = false;
            state.enableValidation = false;
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
            state.editMode = false;
        };

        return {
            ...toRefs(state),
            onDictValidate,
            onCancel,
            onSave,
        };
    },

});
</script>

<style lang="scss" scoped>
    .extra-btns {
        float: right;
        .btn {
            margin-left: .5rem;
        }
    }
</style>
