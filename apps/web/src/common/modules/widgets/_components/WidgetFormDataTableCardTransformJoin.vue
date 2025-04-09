<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';

import { random } from 'lodash';

import {
    PFieldGroup, PI, PSelectDropdown, PFieldTitle, PButton, PIconButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_TABLE_OPERATOR, JOIN_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { JoinOptions, JoinType } from '@/common/modules/widgets/types/widget-model';




interface OnKeyItem {
    leftKey?: string;
    rightKey?: string;
}
const COMPONENT_RANDOM_KEY = `join-${random()}`;
const props = defineProps<TransformDataTableProps<JoinOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: JoinOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTables: props.originData?.data_tables,
});
const howInfo = ref<JoinOptions['how']>(props.originData.how);
const leftKeyInfo = ref<JoinOptions['left_keys']>(props.originData.left_keys);
const rightKeyInfo = ref<JoinOptions['right_keys']>(props.originData.right_keys);

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    proxyOperatorOptions: useProxyValue<JoinOptions>('operator-options', props, emit),
    joinTypeItems: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'Left Join', name: JOIN_TYPE.LEFT, icon: 'ic_join-left' },
        { label: 'Right Join', name: JOIN_TYPE.RIGHT, icon: 'ic_join-right' },
        { label: 'Outer Join', name: JOIN_TYPE.OUTER, icon: 'ic_join-outer' },
        { label: 'Inner Join', name: JOIN_TYPE.INNER, icon: 'ic_join-inner' },
    ]),
    invalid: computed<boolean>(() => {
        if (state.proxyOperatorOptions.data_tables.length < 2) return true;
        if (!state.proxyOperatorOptions.data_tables.every((d) => !!d)) return true;
        if (!state.selectedOnKeyList.length) return true;
        if (state.selectedOnKeyList.some((d) => !d.leftKey || !d.rightKey)) return true;
        return !howInfo.value;
    }),
    leftKeyMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.proxyOperatorOptions.data_tables.length < 1) return [];
        const _targetDataTableId = state.proxyOperatorOptions.data_tables[0];
        const _targetDataTable = dataTableList.value.find((d) => d.data_table_id === _targetDataTableId);
        return Object.keys(_targetDataTable?.labels_info ?? {})?.map((d) => ({
            name: d,
            label: d,
        })) ?? [];
    }),
    rightKeyMenuItems: computed(() => {
        if (state.proxyOperatorOptions.data_tables.length < 2) return [];
        const _targetDataTableId = state.proxyOperatorOptions.data_tables[1];
        const _targetDataTable = dataTableList.value.find((d) => d.data_table_id === _targetDataTableId);
        return Object.keys(_targetDataTable?.labels_info ?? {})?.map((d) => ({
            name: d,
            label: d,
        })) ?? [];
    }),
    selectedOnKeyList: [{}] as OnKeyItem[],
});

/* Event */
const handleUpdateHow = (val: JoinType) => {
    howInfo.value = val;
};
const handleClickAddKey = () => {
    state.selectedOnKeyList.push({});
};
const handleUpdateOnKey = (key: 'leftKey'|'rightKey', idx: number, val: string) => {
    state.selectedOnKeyList[idx][key] = val;
    state.selectedOnKeyList = [...state.selectedOnKeyList];
};
const handleRemoveKey = (idx: number) => {
    state.selectedOnKeyList.splice(idx, 1);
    state.selectedOnKeyList = [...state.selectedOnKeyList];
};

/* Watcher */
watch([dataTableInfo, howInfo, () => state.selectedOnKeyList], ([_dataTableInfo, _howInfo, _selectedOnKeyList]) => {
    state.proxyOperatorOptions = {
        data_tables: _dataTableInfo.dataTables || [],
        how: _howInfo,
        left_keys: _selectedOnKeyList.map((d) => d.leftKey || ''),
        right_keys: _selectedOnKeyList.map((d) => d.rightKey || ''),
    };
}, { deep: true, immediate: true });
watch(dataTableInfo, (_curr, _prev) => {
    if (_curr?.dataTables?.[0] !== _prev?.dataTables?.[0]) {
        state.selectedOnKeyList = state.selectedOnKeyList.map((d) => ({
            leftKey: d.leftKey,
            rightKey: '',
        }));
    }
    if (_curr?.dataTables?.[1] !== _prev?.dataTables?.[1]) {
        state.selectedOnKeyList = state.selectedOnKeyList.map((d) => ({
            leftKey: d.leftKey,
            rightKey: '',
        }));
    }
}, { deep: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });

onMounted(() => {
    state.selectedOnKeyList = leftKeyInfo.value?.map((d, idx) => ({
        leftKey: d,
        rightKey: rightKeyInfo.value[idx],
    })) ?? [{}];
});
</script>

<template>
    <div class="widget-form-data-table-card-transform-join">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.JOIN"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <p-field-group label="How"
                           required
            >
                <p-select-dropdown class="join-type-dropdown"
                                   :menu="state.joinTypeItems"
                                   :selected="howInfo"
                                   block
                                   @update:selected="handleUpdateHow"
                >
                    <template v-if="howInfo"
                              #dropdown-left-area
                    >
                        <p-i class="selected-join-type-icon"
                             :name="state.joinTypeItems.find((item) => item.name === howInfo)?.icon"
                             width="1rem"
                             height="1rem"
                        />
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group label="On"
                           required
            >
                <div class="on-field-name-wrapper">
                    <p-field-title size="sm"
                                   color="gray"
                                   class="col-span-6"
                    >
                        {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.LEFT_KEY') }}
                    </p-field-title>
                    <p-field-title size="sm"
                                   color="gray"
                                   class="col-span-5"
                    >
                        {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.RIGHT_KEY') }}
                    </p-field-title>
                </div>
                <div v-for="(onKey, oIdx) in state.selectedOnKeyList"
                     :key="`${COMPONENT_RANDOM_KEY}-${oIdx}`"
                     class="on-form-wrapper"
                >
                    <p-select-dropdown :menu="state.leftKeyMenuItems"
                                       :selected="onKey.leftKey"
                                       class="select-dropdown"
                                       @update:selected="handleUpdateOnKey('leftKey', oIdx, $event)"
                    />
                    <span class="equal-text">=</span>
                    <p-select-dropdown :menu="state.rightKeyMenuItems"
                                       :selected="onKey.rightKey"
                                       class="select-dropdown right-key"
                                       @update:selected="handleUpdateOnKey('rightKey', oIdx, $event)"
                    />
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   class="delete-button"
                                   :disabled="state.selectedOnKeyList.length === 1"
                                   @click="handleRemoveKey(oIdx)"
                    />
                </div>
            </p-field-group>
            <p-button class="add-key-button"
                      style-type="tertiary"
                      icon-left="ic_plus_bold"
                      @click="handleClickAddKey"
            >
                {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.ADD_LABEL') }}
            </p-button>
        </widget-form-data-table-card-transform-form-wrapper>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-join {
    .on-field-name-wrapper {
        @apply grid grid-cols-12;
        margin-bottom: 0.25rem;
    }
    .on-form-wrapper {
        @apply grid grid-cols-12 gap-1;
        .select-dropdown {
            @apply col-span-5 bg-indigo-100 rounded;
            padding: 0.25rem;
            &.right-key {
                @apply bg-peacock-100;
            }
        }
        .equal-text {
            @apply col-span-1 text-gray-500;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .delete-button {
            @apply col-span-1;
            display: flex;
            margin: auto 0;
        }
    }
    .add-key-button {
        width: 6.8125rem;
    }
}
</style>
