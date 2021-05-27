<template>
    <fragment>
        <p-autocomplete-search v-model="search" :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_TAG')"
                               :menu="allTagsMenuItems"
                               :loading="loading"
                               @select-menu="onSelectTag"
        >
            <template #menu-item--format="{item, id}">
                <p-check-box :id="id" v-model="selectedTagKeys" class="tag-menu-item"
                             :value="item.name"
                >
                    {{ item.label }}
                </p-check-box>
            </template>
            <template #menu-no-data-format>
                <div v-if="loading" class="fake-no-data" />
            </template>
        </p-autocomplete-search>
        <div class="tag-box">
            <p-tag v-for="(tag, i) in selectedTagKeys" :key="tag" @delete="onDeleteTag(i)">
                {{ tag ? tag.slice(TAGS_PREFIX.length) : '' }}
            </p-tag>
        </div>
    </fragment>
</template>

<script lang="ts">
import {
    PAutocompleteSearch, PCheckBox, PTag,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { TAGS_PREFIX } from '@/common/modules/custom-field-modal/config';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { camelCase, uniq } from 'lodash';
import { makeProxy } from '@/lib/compostion-util';

interface Props {
    selectedKeys: string[];
    resourceType: string;
    options: any;
}

export default {
    name: 'SelectTagColumns',
    components: {
        PAutocompleteSearch,
        PCheckBox,
        PTag,
    },
    props: {
        selectedKeys: {
            type: Array,
            default: () => [],
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
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            search: '',
            loading: true,
            proxySelectedKeys: makeProxy('selectedKeys', props, emit),
            selectedTagKeys: computed<string[]>({
                get: () => props.selectedKeys.filter(key => key.startsWith(TAGS_PREFIX)),
                set: (val: string[]) => {
                    state.proxySelectedKeys = props.selectedKeys
                        .filter(key => !key.startsWith(TAGS_PREFIX))
                        .concat(val);
                },
            }),
            allTags: [] as string[],
            allTagsMenuItems: computed(() => state.allTags.map(d => ({
                name: `${TAGS_PREFIX}${d}`,
                label: d,
                type: 'item',
            }))),
        });

        const onDeleteTag = (idx) => {
            state.selectedTagKeys.splice(idx, 1);
            vm.$nextTick(() => {
                state.selectedTagKeys = [...state.selectedTagKeys];
            });
        };

        const onSelectTag = (item: MenuItem) => {
            state.search = '';
            const idx = state.selectedTagKeys.findIndex(k => k === item.name);
            if (idx !== -1) {
                onDeleteTag(idx);
            } else {
                state.selectedTagKeys = [...state.selectedTagKeys, item.name];
            }
        };

        const clearSelectedTags = () => {
            state.selectedTagKeys = [];
            state.search = '';
        };

        const tagsApiQueryHelper = new ApiQueryHelper().setOnly('tags.key');
        const getTags = async () => {
            state.loading = true;
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
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.resourceType, (after, before) => {
            if (state.allTags.length === 0 && after && after !== before) {
                getTags();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onDeleteTag,
            onSelectTag,
            clearSelectedTags,
            TAGS_PREFIX,
        };
    },
};
</script>

<style lang="postcss" scoped>

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
    .text {
        word-break: break-word;
    }
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
.p-autocomplete-search::v-deep {
    .p-context-menu {
        min-width: 100%;
        .context-item:not(.empty) {
            padding: 0;
            white-space: unset;
        }
        .fake-no-data {
            height: 1rem;
        }
    }
}
</style>
