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
            <p-toolbox-table v-bind="apiHandler.tableTS.state"
                             :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                             :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                             :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                             :loading.sync="apiHandler.tableTS.syncState.loading"
                             :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                             :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                             @changePageSize="apiHandler.getData"
                             @changePageNumber="apiHandler.getData"
                             @clickRefresh="apiHandler.getData"
                             @changeSort="apiHandler.getData"
                             @rowLeftClick="onSelect"
            >
                <template #toolbox-left>
                    <p-search v-model="apiHandler.tableTS.searchText.value" @search="onSearch" @delete="onSearch()" />
                </template>
            </p-toolbox-table>
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
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import PTag from '@/components/molecules/tags/Tag.vue';
import { tagList } from '@/components/molecules/tags/toolset';
import { fluentApi } from '@/lib/fluent-api';
import { SearchTableFluentAPI } from '@/lib/api/table';
import { reactive, toRefs } from '@vue/composition-api';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import { showErrorMessage } from '@/lib/util';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PSearch,
        PToolboxTable,
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
        const formState = reactive({
            tagTools: tagList(null),
        });
        const proxyVisible = makeProxy('visible', props, context.emit);
        const projectId = context.root.$route.params.id;


        // List api Handler for query search table
        const MemberListAction = fluentApi.identity().user().list();
        const apiHandler = new SearchTableFluentAPI(MemberListAction, {
            shadow: false,
            border: false,
            padding: true,
            selectable: false,
            dragable: false,
            fields: [
                { label: 'Name', name: 'name', type: 'item' },
                { label: 'ID', name: 'user_id', type: 'item' },
                { label: 'Email', name: 'email', type: 'item' },
            ],
            responsiveStyle: { height: '19rem', overflow: 'auto', padding: '-1rem' },
        });

        const onSelect = (item) => {
            formState.tagTools.addTag(item.user_id);
        };

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

        const onSearch = async (val?: string) => {
            if (!val) apiHandler.tableTS.searchText.value = '';
            await apiHandler.getData();
        };

        const init = () => {
            apiHandler.getData();
        };

        init();

        return {
            ...toRefs(formState),
            apiHandler,
            confirm,
            onSelect,
            proxyVisible,
            onSearch,
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
        .tag {
            @apply bg-white border border-primary;
        }
    }
</style>
