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
import { tagList } from '@/components/molecules/tags/PTag.toolset';
import { fluentApi } from '@/lib/fluent-api';
import { reactive, toRefs } from '@vue/composition-api';
import PBoxLayout from '@/components/molecules/layouts/box-layout/PBoxLayout.vue';
import { showErrorMessage } from '@/lib/util';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';

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
    setup(props, context) {
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
        const proxyVisible = makeProxy('visible', props, context.emit);
        const projectId = context.root.$route.params.id;

        // List api Handler for query search table
        const listUser = async () => {
            try {
                const resp = await fluentApi.identity().user().list()
                    .setPageSize(state.pageSize)
                    .setThisPage(state.thisPage)
                    .setSortBy(state.sortBy)
                    .setSortDesc(state.sortDesc)
                    .setKeyword(state.keyword)
                    .execute();
                state.items = resp.data.results;
                state.totalCount = resp.data.total_count || 0;
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
        }

        const confirm = async () => {
            const users = formState.tagTools.tags;
            try {
                await fluentApi.identity().project().addMember().setId(projectId)
                    .setSubIds(users)
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Add Member',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to Add Member', e, context.root);
            } finally {
                context.emit('confirm');
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
