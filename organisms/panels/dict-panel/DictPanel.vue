<template>
    <div>
        <p-panel-top :use-total-count="true" :total-count="Object.keys(dict).length">
            <template>{{ $t('WORD.TAG') }}</template>
            <template #extra>
                <slot name="extra">
                    <p-button v-if="!editMode" style-type="primary-dark"
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
                                          :disabled="showValidation && !isAllValid"
                                          :button-bind="{styleType: 'secondary'}"
                                          @click="onSave"
                        >
                            {{ $t('BTN.SAVE') }}
                        </p-loading-button>
                    </div>
                </slot>
            </template>
        </p-panel-top>
        <p-dict-input-group v-if="editMode"
                            :items.sync="items"
                            :disabled="loading"
                            :invalid-messages="invalidMessages"
                            :show-validation="showValidation"
                            :show-empty-input="showEmptyInput"
                            v-on="dictIGListeners"
        />
        <div v-else>
            <p-data-table v-bind="tableState" />
        </div>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    reactive, toRefs, getCurrentInstance, computed,
} from '@vue/composition-api';
import { DataTableState } from '@/components/organisms/tables/data-table/DataTable.toolset';
import { makeTrItems } from '@/lib/view-helper';
import { dictPanelProps, DictPanelPropsType } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';

import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PLoadingButton from '@/components/molecules/buttons/loading-button/PLoadingButton.vue';
import { makeProxy } from '@/lib/compostion-util';
import {
    dictValidation,
    getNewDict,
    toDictItems,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';

const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');

export default {
    name: 'PDictPanel',
    components: {
        PPanelTop,
        PDictInputGroup,
        PButton,
        PLoadingButton,
        PDataTable,
    },
    props: dictPanelProps,
    setup(props: DictPanelPropsType) {
        const vm: any = getCurrentInstance();

        const state: any = reactive({
            proxyEditMode: makeProxy('editMode'),
            tableState: new DataTableState({
                fields: makeTrItems([
                    ['name', 'WORD.KEY'],
                    ['value', 'WORD.VALUE'],
                ], vm),
                items: computed(() => _.map(props.dict, (v, k) => ({ name: k, value: v }))),
                colCopy: true,
            }).state,
            showValidation: false,
            items: toDictItems(props.dict),
        });

        // @ts-ignore
        const { invalidMessages, allValidation, itemValidation } = dictValidation(computed(() => state.items));
        const isAllValid = computed(() => _.every(invalidMessages.value, (item: any) => !item.key && !item.value));
        const newDict = computed(() => getNewDict(state.items, invalidMessages.value));

        const dictIGListeners = {
            'change:value': _.debounce((idx) => { itemValidation(idx, 'value'); }, 100),
            'change:key': _.debounce(() => { allValidation('key', false); }, 100),
            'change:add': (idx) => { itemValidation(idx); },
            'change:delete': () => { allValidation(); },
        };

        const onClickEditMode = () => {
            state.items = toDictItems(props.dict);
            state.proxyEditMode = true;
        };


        const reset = () => {
            state.showValidation = false;
            state.items = toDictItems(props.dict);
        };

        const onCancel = () => {
            state.proxyEditMode = false;
            reset();
        };

        const onSave = () => {
            if (!state.showValidation) state.showValidation = true;
            if (!allValidation()) return;

            vm.$emit('update:dict', newDict.value);
            vm.$emit('save', newDict.value);
        };

        return {
            ...toRefs(state),
            invalidMessages,
            isAllValid,
            dictIGListeners,
            onClickEditMode,
            onCancel,
            onSave,
        };
    },

};
</script>

<style lang="postcss" scoped>
    .extra-btns {
        float: right;
        .p-button {
            margin-left: 0.5rem;
        }
    }
</style>
