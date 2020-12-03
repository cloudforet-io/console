<template>
    <p-button-modal
        :header-title="$tc('PROJECT.DETAIL.MODAL_ADD_MEMBER', items.length)"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm($event)"
    >
        <template #body>
            <p-search-table :fields="fields"
                            :items="items"
                            :total-count="totalCount"
                            :loading="loading"
                            :style="{
                                height: '19rem', padding: '-1rem'
                            }"
                            :selectable="false"
                            @change="onChange"
                            @init="onChange"
                            @rowLeftClick="onSelect"
            />
            <p class="tag-title">
                {{ $t('PROJECT.DETAIL.MODAL_ADDED_MEMBERS') }}
            </p>
            <p class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       class="tag"
                       @delete="tagTools.deleteTag(idx)"
                >
                    {{ tag }}
                </p-tag>
            </p>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import PTag from '@/components/molecules/tags/PTag.vue';
import {
    ComponentRenderProxy,
    getCurrentInstance,
    reactive, ref, Ref, toRefs,
} from '@vue/composition-api';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import { isEqual } from 'lodash';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { SearchTableListeners, Options } from '@/components/organisms/tables/search-table/type';

const tagList = (proxyTags?: Ref<string[]>|null, checkDuplicate = true, eventBus?: any, eventName?: string, addTagCallBack?: any) => {
    const tags: Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx: number) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const deleteAllTags = () => {
        tags.value = [];
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const validation = value => tags.value.every(tag => !isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
        deleteAllTags,
    });
};

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PSearchTable,
        PButtonModal,
        PTag,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: [
                { label: 'Name', name: 'name', type: 'item' },
                { label: 'ID', name: 'user_id', type: 'item' },
                { label: 'Email', name: 'email', type: 'item' },
            ],
            items: [] as any,
            loading: false,
            totalCount: 0,
            options: {} as Options,
        });
        const formState = reactive({
            tagTools: tagList(null),
        });
        const proxyVisible = makeProxy('visible', props, emit);
        const projectId = root.$route.params.id;

        const getQuery = () => new QueryHelper()
            .setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            )
            .setKeyword(state.options.searchText)
            .data;

        // List api Handler for query search table
        const listUser = async () => {
            state.loading = true;
            try {
                const resp = await SpaceConnector.client.identity.user.list({
                    query: getQuery(),
                });
                state.items = resp.results;
                state.totalCount = resp.total_count || 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const onSelect = (item) => {
            formState.tagTools.addTag(item.user_id);
        };

        const onChange: SearchTableListeners['change'] = async (options) => {
            if (options) {
                state.options = options;
                await listUser();
            }
        };

        const confirm = async () => {
            const users = formState.tagTools.tags;
            try {
                await SpaceConnector.client.identity.project.member.add({
                    project_id: projectId,
                    users,
                });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ADD_MEMBER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ADD_MEMBER'), e, root);
            } finally {
                emit('confirm');
                proxyVisible.value = false;
            }
        };

        listUser();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            listUser,
            confirm,
            onSelect,
            onChange,
            proxyVisible,
        };
    },
};
</script>

<style lang="postcss" scoped>

.tag-title {
    @apply font-semibold leading-normal text-sm mb-1 mt-8;
}
.tag-container {
    height: 7.5rem;
    padding: 0.5rem;
    border-radius: 0.125rem;
    background-color: theme('colors.primary4');
    border: 0.0625rem solid theme('colors.gray.100');

    /*
    @define-mixin box-color $theme, $bg-color, $line-color {
        &.$(theme) {
            background-color: $bg-color;
            border-color: $line-color;
        }
    }
    @mixin box-color primary4, theme('colors.primary4'), theme('colors.gray.100');
     */

    >>> .p-tag.deletable {
        @apply bg-white border border-primary;
        .p-i-icon {
            @apply text-primary;
        }
    }
}
</style>
