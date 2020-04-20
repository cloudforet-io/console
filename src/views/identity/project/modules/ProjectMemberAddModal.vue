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
        <template #body="{height}">
            <p-dynamic-view view_type="query-search-table"
                            :api-handler="apiHandler"
                            :data_source="dataSource"
                            :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto', 'padding':'-1rem'}}"
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
    makeProxy, requiredValidation,
} from '@/lib/compostion-util';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import {computed, reactive, toRefs} from '@vue/composition-api';
import { api } from '@/lib/api/axios';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';

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
        const memberKeyAutoCompletes = ['user_id', 'name', 'email'];
        const project_id = context.root.$route.params.id;

        const memberACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: memberKeyAutoCompletes,
                suggestKeys: memberKeyAutoCompletes,
            },
        };

        // List api Handler for query search table
        const MemberListAction = fluentApi.identity().user().list();
        const apiHandler = new QuerySearchTableFluentAPI(MemberListAction, {
            shadow: false,
            border: false,
            padding: true,
            selectable: false,
            dragable: false,
        }, undefined, memberACHandlerMeta);

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
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Add Member',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Add Fail',
                        text: 'Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
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
