<template>
    <div class="mb-8">
        <p-panel-top :use-total-count="true" :total-count="tags.length">
            <template>{{ $t('COMMON.TAGS.TITLE') }}</template>
            <template #extra>
                <p-button style-type="primary-dark"
                          @click="editTag"
                >
                    {{ $t('COMMON.TAGS.EDIT') }}
                </p-button>
            </template>
        </p-panel-top>

        <p-data-table
            :fields="fields"
            :items="tags"
            :loading="loading"
            :col-copy="true"
        />
        <tags-page v-if="tagEditPageVisible"
                   :tags="tags"
                   :resource-id="resourceId"
                   :resource-key="resourceKey" :resource-type="resourceType"
                   @close="closeTag"
                   @update="updateTag"
        />
    </div>
</template>

<script lang="ts">
import { get, camelCase } from 'lodash';

import {
    computed, reactive, toRefs, watch, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import TagsPage from '@/views/common/components/tags/TagsPage.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { TagItem } from '@/views/common/components/tags/type';

import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'TagsPanel',
    components: {
        PDataTable,
        PPanelTop,
        PButton,
        TagsPage,
    },
    props: {
        resourceKey: {
            type: String,
            default: '',
            required: true,
        },
        resourceId: {
            type: String,
            default: '',
            required: true,
        },
        resourceType: {
            type: String,
            default: '',
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const apiKeys = computed(() => props.resourceType.split('.').map(d => camelCase(d)));
        const api = computed(() => get(SpaceConnector.client, apiKeys.value));

        const state = reactive({
            loading: true,
            tags: [] as TagItem[],
            fields: computed(() => [
                { name: 'key', label: vm.$t('COMMON.TAGS.KEY'), type: 'item' },
                { name: 'value', label: vm.$t('COMMON.TAGS.VALUE'), type: 'item' },
            ]),
        });
        const tagState = reactive({
            tagEditPageVisible: false,
        });

        /* api */
        const getTags = async () => {
            if (!api.value) {
                state.tags = [];
                state.loading = false;
            }

            try {
                const res = await api.value.get({
                    [props.resourceKey]: props.resourceId,
                    query: { only: ['tags'] },
                });
                state.tags = res.tags;
            } catch (e) {
                state.tags = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const editTag = async () => {
            tagState.tagEditPageVisible = true;
        };
        const closeTag = async () => {
            tagState.tagEditPageVisible = false;
        };
        const updateTag = async () => {
            await getTags();
            tagState.tagEditPageVisible = false;
        };

        watch([() => props.resourceKey, () => props.resourceId, () => props.resourceType],
            async ([resourceKey, resourceId, resourceType]) => {
                if (resourceKey && resourceId && resourceType) {
                    await getTags();
                }
            }, { immediate: true });

        return {
            ...toRefs(state),
            ...toRefs(tagState),
            editTag,
            closeTag,
            updateTag,
        };
    },
};
</script>
