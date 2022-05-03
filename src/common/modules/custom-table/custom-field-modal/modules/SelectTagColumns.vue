<template>
    <fragment>
        <p-autocomplete-search v-model="search" :placeholder="$t('COMMON.CUSTOM_FIELD_MODAL.SEARCH_TAG')"
                               :menu="allTagsMenuItems"
                               :loading="loading"
                               use-fixed-menu-style
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
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PAutocompleteSearch, PCheckBox, PTag,
} from '@spaceone/design-system';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { TAGS_PREFIX } from '@/common/modules/custom-table/custom-field-modal/config';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    selectedKeys: string[];
    allTags: string[];
    loading: boolean;
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
        allTags: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            search: '',
            proxySelectedKeys: useProxyValue('selectedKeys', props, emit),
            selectedTagKeys: computed<string[]>({
                get: () => props.selectedKeys.filter(key => key.startsWith(TAGS_PREFIX)),
                set: (val: string[]) => {
                    state.proxySelectedKeys = props.selectedKeys
                        .filter(key => !key.startsWith(TAGS_PREFIX))
                        .concat(val);
                },
            }),
            allTagsMenuItems: computed(() => props.allTags.map(d => ({
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

        const onSelectTag = (item: Required<MenuItem>) => {
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
    width: 100%;
    .check-icon {
        flex-shrink: 0;
        margin-right: 0.5rem;
        margin-top: 0.125rem;
    }
    .text {
        word-break: break-word;
        white-space: normal;
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
        max-height: 50vh;
    }
}
</style>
