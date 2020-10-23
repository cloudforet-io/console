<template>
    <p-button-modal
        header-title="Add Member"
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
                            :sort-by.sync="sortBy"
                            :sort-desc.sync="sortDesc"
                            :loading.sync="loading"
                            :this-page.sync="thisPage"
                            :page-size.sync="pageSize"
                            :style="{
                                height: '19rem', padding: '-1rem'
                            }"
                            :selectable="false"
                            @change="onChange"
                            @rowLeftClick="onSelect"
            />
            <p class="tag-title">
                Added Members
            </p>
            <p-box-layout class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       class="tag"
                       @delete="tagTools.deleteTag(idx)"
                >
                    {{ tag }}
                </p-tag>
            </p-box-layout>
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
    reactive, ref, Ref, toRefs,
} from '@vue/composition-api';
import PBoxLayout from '@/components/molecules/layouts/box-layout/PBoxLayout.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import { isEqual } from 'lodash';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';

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
        PBoxLayout,
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
        const state = reactive({
            fields: [
                { label: 'Name', name: 'name', type: 'item' },
                { label: 'ID', name: 'user_id', type: 'item' },
                { label: 'Email', name: 'email', type: 'item' },
            ],
            items: [] as any,
            loading: false,
            pageSize: 15,
            thisPage: 1,
            sortBy: 'user_id',
            sortDesc: true,
            totalCount: 0,
            searchText: '',
            keyword: '',
        });
        const formState = reactive({
            tagTools: tagList(null),
        });
        const proxyVisible = makeProxy('visible', props, emit);
        const projectId = root.$route.params.id;

        const query = new QueryHelper()
            .setPageStart(getPageStart(state.thisPage, state.pageSize))
            .setPageLimit(state.pageSize)
            .setKeyword(state.keyword);

        // List api Handler for query search table
        const listUser = async () => {
            try {
                const resp = await SpaceConnector.client.identity.user.list({
                    query: query.data,
                });
                state.items = resp.results;
                state.totalCount = resp.total_count || 0;
            } catch (e) {
                state.items = [];
                console.error(e);
            }
        };

        const onSelect = (item) => {
            formState.tagTools.addTag(item.user_id);
        };

        const onChange = async (item) => {
            try {
                state.keyword = item.searchText;
                await listUser();
            } catch (e) {
                console.error(e);
            }
        };

        const confirm = async () => {
            const users = formState.tagTools.tags;
            try {
                await SpaceConnector.client.identity.project.member.add({
                    project_id: projectId,
                    users,
                });
                showSuccessMessage('success', 'Add Member', root);
            } catch (e) {
                showErrorMessage('Fail to Add Member', e, root);
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
        >>> .p-tag.deletable {
            @apply bg-white border border-primary;
            .p-i-icon {
                @apply text-primary;
            }
        }
    }
</style>
