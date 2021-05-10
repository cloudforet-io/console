<template>
    <p-button-modal :visible.sync="proxyVisible" :header-title="$t('COMMON.CUSTOM_FIELD_MODAL.TITLE')"
                    :scrollable="false"
                    :loading="loading"
                    :disabled="!isValid"
                    @confirm="updatePageSchema"
    >
        <template #body>
            <p-data-loader :loading="loading" :min-loading-time="500">
                <div class="contents-wrapper">
                    <section class="attribute-column-section">
                        <h3 class="section-title">
                            {{ $t('COMMON.CUSTOM_FIELD_MODAL.ATTRIBUTE_COL') }}
                        </h3>
                        <h4 class="section-desc">
                            <span v-if="loading || isValid" class="text">{{ $t('COMMON.CUSTOM_FIELD_MODAL.ATTRIBUTE_COL_DESC') }}</span>
                            <span v-else class="invalid-text">{{ $t('COMMON.CUSTOM_FIELD_MODAL.COL_REQUIRED') }}</span>
                            <p-button :outline="true" size="sm" style-type="gray900"
                                      @click="setColumnsDefault"
                            >
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.DEFAULT') }}
                            </p-button>
                        </h4>
                        <p-search v-model="search" :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_ATTRIBUTE_COL')" />

                        <header>
                            <p-check-box :selected="isAllSelected" :value="true"
                                         @change="onChangeAllSelect"
                            />
                            <span class="text">{{ $t('COMMON.CUSTOM_FIELD_MODAL.COL_NAME') }}</span>
                        </header>

                        <div class="column-items-wrapper">
                            <draggable v-model="selectedColumns" draggable=".draggable-item" ghost-class="ghost">
                                <column-item v-for="column in selectedColumns" :key="column.key"
                                             v-model="selectedAllColumnKeys"
                                             :item="column"
                                             :search-text="search"
                                             draggable
                                />
                            </draggable>

                            <column-item v-for="column in unselectedColumns" :key="column.key"
                                         v-model="selectedAllColumnKeys"
                                         :item="column"
                                         :search-text="search"
                            />
                        </div>
                    </section>

                    <section>
                        <h3 class="section-title">
                            {{ $t('COMMON.CUSTOM_FIELD_MODAL.TAG_COL') }}
                        </h3>
                        <h4 class="section-desc">
                            <span>{{ $t('COMMON.CUSTOM_FIELD_MODAL.TAG_COL_DESC') }}</span>
                            <p-button :outline="true" size="sm" style-type="gray900"
                                      @click="clearSelectedTags"
                            >
                                {{ $t('COMMON.CUSTOM_FIELD_MODAL.CLEAR_ALL') }}
                            </p-button>
                        </h4>
                        <p-select-dropdown select-item=""
                                           :items="allTagsMenuItems"
                                           auto-height
                                           :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SELECT_TAG')"
                                           :use-custom-style="true"
                        >
                            <template #menu-item="{item}">
                                <p-check-box v-model="selectedTagColumnKeys" class="tag-menu-item" :value="item.name">
                                    {{ item.label }}
                                </p-check-box>
                            </template>
                        </p-select-dropdown>
                        <div class="tag-box">
                            <p-tag v-for="(tag, i) in selectedTagColumnKeys" :key="tag" @delete="onDeleteTag(i)">
                                {{ tag ? tag.slice(TAGS_PREFIX.length) : '' }}
                            </p-tag>
                        </div>
                    </section>
                </div>
            </p-data-loader>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PButton,
    PButtonModal, PCheckBox, PDataLoader, PSearch, PSelectDropdown, PTag,
} from '@spaceone/design-system';
import { camelCase, uniq, uniqBy } from 'lodash';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { i18n } from '@/translations';
import draggable from 'vuedraggable';
import ColumnItem from '@/common/modules/custom-field-modal/ColumnItem.vue';
import { TAGS_OPTIONS, TAGS_PREFIX } from '@/common/modules/custom-field-modal/config';

interface Props {
    visible: boolean;
    resourceType: string;
    options: any;
}

export default {
    name: 'CustomFieldModal',
    components: {
        ColumnItem,
        PButtonModal,
        PSearch,
        PSelectDropdown,
        PButton,
        PCheckBox,
        PTag,
        PDataLoader,
        draggable,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
        resourceType: {
            type: String,
            default: '',
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        let schema: any = {};

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            search: '',
            isAllSelected: computed(() => state.selectedColumns.length === state.allColumns.length),
            loading: true,
            currentColumns: [] as DynamicField[],
            availableColumns: [] as DynamicField[],
            selectedColumns: [] as DynamicField[],
            // eslint-disable-next-line camelcase
            defaultColumns: computed<DynamicField[]>(() => state.availableColumns.filter(d => !d.options?.is_optional)),
            allColumns: computed<DynamicField[]>(() => uniqBy(state.selectedColumns.concat(state.availableColumns), d => d.key)),
            unselectedColumns: computed<DynamicField[]>(() => state.allColumns.filter(d => !state.selectedAllColumnKeys.includes(d.key))),
            selectedAllColumnKeys: computed<string[]>({
                get: () => state.selectedColumns.map(d => d.key),
                set: (val: string[]) => {
                    state.selectedColumns = val.map((d) => {
                        if (d.startsWith(TAGS_PREFIX)) return { key: d, name: d, options: TAGS_OPTIONS };
                        return state.availableColumns.find(col => col.key === d) || { key: d, name: d };
                    });
                },
            }),
            selectedTagColumnKeys: computed<string[]>({
                get: () => state.selectedColumns.filter(d => d.key.startsWith(TAGS_PREFIX)).map(d => d.key),
                set: (val: string[]) => {
                    const compare = [...val];
                    const selectedColumns: any[] = state.selectedColumns.filter((d) => {
                        if (d.key.startsWith(TAGS_PREFIX)) {
                            const idx = compare.findIndex(tagKey => tagKey === d.key);
                            if (idx === -1) return false;
                            compare.splice(idx, 1);
                        }
                        return true;
                    });
                    state.selectedColumns = selectedColumns.concat(compare.map(d => ({ key: d, name: d, options: TAGS_OPTIONS })));
                },
            }),
            allTags: [] as string[],
            allTagsMenuItems: computed(() => state.allTags.map(d => ({
                name: `${TAGS_PREFIX}${d}`,
                label: d,
                type: 'item',
            }))),
            isValid: computed(() => state.selectedColumns.length > 0),
        });

        const onChangeAllSelect = (val) => {
            if (val) {
                state.selectedColumns = [...state.allColumns];
            } else {
                state.selectedColumns = [];
            }
        };


        const onDeleteTag = (idx) => {
            state.selectedTagColumnKeys.splice(idx, 1);
            vm.$nextTick(() => {
                state.selectedTagColumnKeys = [...state.selectedTagColumnKeys];
            });
        };

        const clearSelectedTags = () => {
            state.selectedColumns = state.selectedColumns.filter(d => !d.key.startsWith(TAGS_PREFIX));
        };


        const getColumns = async (includeOptionalFields = false) => {
            try {
                const options: any = {
                    // eslint-disable-next-line camelcase
                    include_optional_fields: includeOptionalFields,
                };
                const { provider, cloudServiceGroup, cloudServiceType } = props.options;
                if (provider)options.provider = provider;
                // eslint-disable-next-line camelcase
                if (cloudServiceGroup) options.cloud_service_group = cloudServiceGroup;
                if (cloudServiceType) options.cloud_service_type = cloudServiceType;

                const res = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: props.resourceType,
                    schema: 'table',
                    options,
                });

                schema = res;
                delete schema.options?.search;

                if (includeOptionalFields) {
                    state.availableColumns = res.options?.fields || [];
                } else {
                    state.currentColumns = res.options?.fields || [];
                }
            } catch (e) {
                console.error(e);
                schema = {};
                if (includeOptionalFields) {
                    state.availableColumns = [];
                } else {
                    state.currentColumns = [];
                }
            }
        };

        const setColumnsDefault = async () => {
            state.selectedColumns = [...state.defaultColumns];
        };

        const tagsApiQueryHelper = new ApiQueryHelper().setOnly('tags.key');
        const getTags = async () => {
            try {
                let api = SpaceConnector.client;
                props.resourceType.split('.').forEach((d) => {
                    api = api?.[camelCase(d)];
                });

                tagsApiQueryHelper.setFilters([]);
                const { provider, cloudServiceGroup, cloudServiceType } = props.options;
                if (provider) tagsApiQueryHelper.addFilter({ k: 'provider', v: provider, o: '=' });
                if (cloudServiceGroup) tagsApiQueryHelper.addFilter({ k: 'cloud_service_group', v: cloudServiceGroup, o: '=' });
                if (cloudServiceType) tagsApiQueryHelper.addFilter({ k: 'cloud_service_type', v: cloudServiceType, o: '=' });

                const { results } = await api.list({
                    query: tagsApiQueryHelper.data,
                });

                state.allTags = uniq(results.map(d => Object.keys(d.tags)).flat());
            } catch (e) {
                console.error(e);
                state.allTags = [];
            }
        };

        const resetSelectedStates = () => {
            clearSelectedTags();
            state.selectedColumns = [...state.currentColumns];
        };

        const updatePageSchema = async () => {
            state.loading = true;

            const data = { ...schema };
            if (!data.options) data.options = {};
            data.options.fields = state.selectedColumns;

            const options: any = {};
            const { provider, cloudServiceGroup, cloudServiceType } = props.options;
            if (provider) options.provider = provider;
            // eslint-disable-next-line camelcase
            if (cloudServiceGroup) options.cloud_service_group = cloudServiceGroup;
            if (cloudServiceType) options.cloud_service_type = cloudServiceType;

            try {
                await SpaceConnector.client.addOns.pageSchema.update({
                    resource_type: props.resourceType,
                    schema: 'table',
                    data,
                    options,
                });

                showSuccessMessage(i18n.t('COMMON.CUSTOM_FIELD_MODAL.ALT_S_UPDATE_COL'), '', root);
                emit('complete');
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('COMMON.CUSTOM_FIELD_MODAL.ALT_E_UPDATE_COL'), e, root);
            } finally {
                state.loading = false;
            }
        };


        watch([() => props.visible, () => props.resourceType], async ([visible, resourceType]) => {
            if (visible && resourceType) {
                state.loading = true;
                await Promise.all([getColumns(true), getColumns(false), getTags()]);
                resetSelectedStates();
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onChangeAllSelect,
            onDeleteTag,
            clearSelectedTags,
            setColumnsDefault,
            updatePageSchema,
            TAGS_PREFIX,
        };
    },
};
</script>

<style lang="postcss" scoped>
.contents-wrapper {
    display: flex;
    width: 100%;
    height: 608px;
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
        font-size: 1.125rem;
        line-height: 155%;
        margin-bottom: 0.25rem;
    }
    .section-desc {
        @apply text-gray-500;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        line-height: 120%;
        margin-bottom: 1.25rem;
        .invalid-text {
            @apply text-alert;
            font-weight: bold;
        }
        .p-button {
            flex-shrink: 0;
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

.tag-menu-item.p-checkbox::v-deep {
    @apply bg-transparent;
    display: flex;
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    .check-icon {
        flex-shrink: 0;
        margin-right: 0.5rem;
    }
    &:hover {
        @apply bg-blue-200;
    }
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
