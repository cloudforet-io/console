<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import draggable from 'vuedraggable';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PCheckbox, PDataLoader, PSearch,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigGetParameters } from '@/api-clients/config/user-config/schema/api-verbs/get';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import type { UserType } from '@/api-clients/identity/user/schema/type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import ColumnItem from '@/common/modules/custom-table/custom-field-modal/modules/ColumnItem.vue';



interface Props {
    visible?: boolean;
    resourceType: string;
    defaultField?: DataTableFieldType[];
}

type SelectedColumnMap = Record<string, DataTableFieldType>;

/**
 * @description Merge two field lists. Duplicate check is performed based on key, and the field list given as the first parameter takes precedence.
 * @param fieldsA
 * @param fieldsB
 */
const mergeFields = (fieldsA: DataTableFieldType[], fieldsB: DataTableFieldType[]): DataTableFieldType[] => {
    const allColumns: any[] = [...fieldsA];
    fieldsB.forEach((d) => {
        const isExist = fieldsA.some((c) => c.name === d.name);
        if (!isExist) allColumns.push(d);
    });
    return allColumns;
};

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    resourceType: undefined,
    defaultField: () => ([]),
    options: () => ({}),
    isServerPage: false,
});

const emit = defineEmits<{(e: 'complete'): void;
    (e: 'custom-field-loaded', fields: DataTableFieldType[]|undefined): void;
}>();

const userStore = useUserStore();
const storeState = reactive({
    userId: computed<string|undefined>(() => userStore.state.userId),
    userType: computed<UserType|undefined>(() => userStore.state.userType),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    search: '',
    isAllSelected: computed(() => state.selectedColumns.length === state.allColumns.length),
    loading: true,
    availableColumns: [] as DataTableFieldType[], // all default fields including optional fields.
    currentColumns: [] as DataTableFieldType[], // if custom fields exist, it will be custom fields. if custom fields don't exist, it will be default fields excluding optional fields.
    allColumns: [] as DataTableFieldType[], // fields merged with availableColumns and currentColumns
    selectedColumnMap: {} as SelectedColumnMap,
    selectedColumns: computed<DataTableFieldType[]>({
        get: () => state.allColumns.filter((d) => !!state.selectedColumnMap[d.name]),
        set: (val: DataTableFieldType[]) => {
            const selectedMap: SelectedColumnMap = {};
            val.forEach((d) => { selectedMap[d.name] = d; });
            state.selectedColumnMap = selectedMap;
        },
    }),
    selectedAllColumnKeys: computed<string[]>(() => state.selectedColumns.map((d) => d.name)),
    recommendedSequenceMap: computed<Record<string, number>>(() => {
        const orderMap: Record<string, number> = {};
        state.availableColumns.forEach((d, i) => {
            orderMap[d.name] = i;
        });
        return orderMap;
    }),
    isValid: computed(() => state.loading || state.selectedColumns.length > 0),
});

const sortByRecommendation = () => {
    state.allColumns = state.allColumns.sort((a, b) => {
        if (!state.selectedColumnMap[a.name]) return 1;
        if (!state.selectedColumnMap[b.name]) return -1;
        if (state.recommendedSequenceMap[a.name] === undefined) return 1;
        if (state.recommendedSequenceMap[b.name] === undefined) return -1;
        return state.recommendedSequenceMap[a.name] - (state.recommendedSequenceMap[b.name]);
    });
};

const sortByAlphabet = () => {
    state.allColumns = state.allColumns.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (!state.selectedColumnMap[a.name]) return 1;
        if (!state.selectedColumnMap[b.name]) return -1;
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
};

const onChangeAllSelect = (val) => {
    if (val) {
        state.selectedColumns = [...state.allColumns];
    } else {
        state.selectedColumns = [];
    }
};
const updateCustomTableField = async (userData:{userType:string, userId: string}, resourceType:string, data:DataTableFieldType[]) => {
    try {
        const { userType, userId } = userData;
        await SpaceConnector.clientV2.config.userConfig.set<UserConfigUpdateParameters, UserConfigModel>({
            name: `console:${userType}:${userId}:custom-field:${resourceType}`,
            data: { data },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

interface CustomFieldsConfigData {
    data: DataTableFieldType[];
}

const getCustomTableField = async (userData:{userType:string, userId: string}, resourceType:string):Promise<DataTableFieldType[] | undefined> => {
    let userConfig:UserConfigModel<CustomFieldsConfigData>|undefined;
    try {
        const { userType, userId } = userData;
        const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigGetParameters, ListResponse<UserConfigModel<CustomFieldsConfigData>>>({
            name: `console:${userType}:${userId}:custom-field:${resourceType}`,
        });
        userConfig = results ? results[0] : undefined;
    } catch (e:any) {
        if (e?.status !== 404) ErrorHandler.handleError(e);
        return undefined;
    }
    return (userConfig?.data) ? userConfig?.data?.data : props.defaultField ?? [];
};

const getCurrentColumns = async (): Promise<DataTableFieldType[]> => {
    try {
        const currentSavedFields = await getCustomTableField({
            userType: storeState.userType ?? 'USER',
            userId: storeState.userId ?? '',
        }, props.resourceType) ?? [];
        if (!currentSavedFields) return props.defaultField ?? [];
        return currentSavedFields;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const setColumnsDefault = async () => {
    state.allColumns = state.availableColumns;
    state.selectedColumns = state.availableColumns;
    sortByRecommendation();
};

const handleConfirm = async () => {
    state.loading = true;

    try {
        await updateCustomTableField(
            {
                userType: storeState.userType ?? 'USER',
                userId: storeState.userId ?? '',
            },
            props.resourceType,
            state.selectedColumns,
        );
        showSuccessMessage(i18n.t('COMMON.CUSTOM_FIELD_MODAL.ALT_S_UPDATE_COL'), '');
        emit('custom-field-loaded', state.selectedColumns);
        emit('complete');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.CUSTOM_FIELD_MODAL.ALT_E_UPDATE_COL'));
    } finally {
        state.loading = false;
    }
};

const handleUpdateSelectedKeys = (keys: string[]) => {
    state.selectedColumns = keys.map((key) => state.availableColumns.find((col) => col.name === key) ?? { label: key, name: key } as DataTableFieldType);
};

/* Init */
const initColumns = async () => {
    state.loading = true;
    const currentColumns = await getCurrentColumns();
    state.availableColumns = props.defaultField ?? [];
    state.currentColumns = currentColumns;
    state.allColumns = mergeFields(state.currentColumns, state.availableColumns);
    state.selectedColumns = [...state.currentColumns];
    emit('custom-field-loaded', state.selectedColumns);
    state.loading = false;
};
watch([() => props.visible, () => props.resourceType], ([visible, resourceType]) => {
    if (visible && resourceType) {
        initColumns();
    }
}, { immediate: true });

onMounted(() => {
    initColumns();
});

</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('COMMON.CUSTOM_FIELD_MODAL.TITLE')"
                    :loading="state.loading"
                    :disabled="!state.isValid"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-data-loader :loading="state.loading"
                           :min-loading-time="500"
            >
                <div class="contents-wrapper">
                    <section class="attribute-column-section">
                        <h3 class="section-title">
                            <template v-if="state.isValid">
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.ATTRIBUTE_COL') }}
                            </template>
                            <span v-else
                                  class="invalid-text"
                            >{{ $t('COMMON.CUSTOM_FIELD_MODAL.COL_REQUIRED') }}</span>
                            <p-button style-type="secondary"
                                      size="sm"
                                      @click="setColumnsDefault"
                            >
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.DEFAULT') }}
                            </p-button>
                        </h3>
                        <p-search v-model="state.search"
                                  :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_ATTRIBUTE_COL')"
                        />
                        <div class="sort-wrapper">
                            <label>{{ $t('COMMON.CUSTOM_FIELD_MODAL.SORT_BY') }}</label>
                            <p-button style-type="tertiary"
                                      size="sm"
                                      @click="sortByRecommendation"
                            >
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.RECOMMEND_SORT') }}
                            </p-button>
                            <p-button style-type="tertiary"
                                      size="sm"
                                      @click="sortByAlphabet"
                            >
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.ALPHABETICAL_SORT') }}
                            </p-button>
                        </div>

                        <header>
                            <p-checkbox :selected="state.isAllSelected"
                                        :value="true"
                                        @change="onChangeAllSelect"
                            />
                            <span class="text">{{ $t('COMMON.CUSTOM_FIELD_MODAL.COL_NAME') }}</span>
                        </header>

                        <div class="column-items-wrapper">
                            <draggable v-model="state.allColumns"
                                       draggable=".draggable-item"
                                       ghost-class="ghost"
                            >
                                <column-item v-for="(column, idx) in state.allColumns"
                                             :key="`${column.name}-${idx}`"
                                             :value="state.selectedAllColumnKeys"
                                             :item="column"
                                             :search-text="state.search"
                                             @update:value="handleUpdateSelectedKeys"
                                />
                            </draggable>
                        </div>
                    </section>
                </div>
            </p-data-loader>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-button-modal */
.p-button-modal:deep() {
    .modal-content {
        height: 100vh;
        .modal-body {
            @apply flex;
            .p-data-loader {
                @apply flex-grow;
                max-height: inherit;
            }
        }
    }
}
.contents-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    max-height: inherit;
    overflow: hidden;
}

section {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: inherit;
    overflow: hidden;
    &:first-of-type {
        margin-right: 2rem;
    }
    .section-title {
        @apply text-gray-900;
        display: flex;
        justify-content: space-between;
        font-size: 1.125rem;
        line-height: 155%;
        margin-bottom: 0.875rem;
        .invalid-text {
            @apply text-alert;
        }
    }
    .sort-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        label {
            @apply text-gray-500;
            flex-grow: 1;
            font-size: 0.75rem;
            line-height: 1.5;
            font-weight: bold;
        }
        .p-button {
            flex-shrink: 0;
            &:first-of-type {
                margin-right: 0.5rem;
            }
        }
    }
}

@screen mobile {
    .contents-wrapper {
        display: block;
        overflow: auto;
        height: 100%;
    }
    section {
        max-height: none;
        &:first-of-type {
            margin-right: 0;
            margin-bottom: 2rem;
        }
    }
}

.attribute-column-section {
    .p-search {
        margin-bottom: 0.531rem;
    }
    header {
        @apply border-t border-b border-gray-900 text-gray-900;
        display: flex;
        align-items: center;
        padding: 0.375rem 0.5rem;
        font-weight: bold;
        line-height: 1.2;
        font-size: 0.875rem;
        .p-checkbox {
            margin-right: 0.25rem;
        }
        .text {
            line-height: 1.5;
        }
    }

    .column-items-wrapper {
        flex-grow: 1;
        overflow: auto;
    }
}

</style>
