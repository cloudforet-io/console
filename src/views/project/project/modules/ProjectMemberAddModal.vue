<template>
    <p-button-modal
        header-title="Add Member"
        :centered="true"
        size="xl"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm($event)"
    >
        <template #body>
            <p-dynamic-view view_type="query-search-table"
                            :api-handler="apiHandler"
                            :data_source="dataSource"
                            :vbind="{responsiveStyle:{'overflow-y':'auto','overflow-x':'auto', 'padding':'-1rem'}}"
                            :data="null"
                            v-bind="apiHandler.tableTS.selectState.selectItems"
                            @rowLeftClick="onSelect"
            />
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
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import { DataSourceItem, FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import { reactive, toRefs } from '@vue/composition-api';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import { showErrorMessage } from '@/lib/util';
import { makeValueHandlers } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PButtonModal,
        PDynamicView,
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
        // const memberKeyAutoCompletes = ['user_id', 'name', 'email'];
        const project_id = context.root.$route.params.id;

        // const memberACHandlerMeta = {
        //     handlerClass: QuerySearchTableACHandler,
        //     args: {
        //         keys: memberKeyAutoCompletes,
        //         suggestKeys: memberKeyAutoCompletes,
        //     },
        // };

        // List api Handler for query search table

        class ACHandler extends QuerySearchTableACHandler {
            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.HandlerMap.value = [
                    // ...makeValueHandlers<QueryAPI<any,any>>([
                    //     'name',
                    // ], projectGroupAPI.listProjects().setRecursive(true)),
                    ...makeValueHandlers(['user_id', 'name', 'email'],
                        fluentApi
                            .statisticsTest()
                            .resource()
                            .stat()
                            .setResourceType('identity.User')),
                ];
            }
        }
        const args = {
            keys: [
                'user_id', 'name', 'email',
            ],
            suggestKeys: ['user_id', 'name', 'email'],
        };

        const MemberListAction = fluentApi.identity().user().list();
        const apiHandler = new QuerySearchTableFluentAPI(MemberListAction, {
            shadow: false,
            border: false,
            padding: true,
            selectable: false,
            dragable: false,
        }, undefined, { handlerClass: ACHandler, args });

        const dataSource: DataSourceItem[] = [
            { name: 'ID', key: 'user_id' },
            { name: 'Name', key: 'name' },
            { name: 'Email', key: 'email' },
        ];

        const onSelect = (item) => {
            formState.tagTools.addTag(item.user_id);
        };

        const confirm = () => {
            const users = formState.tagTools.tags;
            fluentApi.identity().project().addMember().setId(project_id)
                .setSubIds(users)
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Add Member',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    showErrorMessage('Fail to Add Member', e, context.root);
                })
                .finally(() => {
                    context.emit('confirm');
                    proxyVisible.value = false;
                });
        };
        return {
            ...toRefs(formState),
            apiHandler,
            dataSource,
            confirm,
            onSelect,
            proxyVisible,
        };
    },
};
</script>

<style lang="postcss" scoped>

    .tag-container {
        height: 120px;
        .tag {
            @apply bg-white border border-primary;
        }
    }
</style>
