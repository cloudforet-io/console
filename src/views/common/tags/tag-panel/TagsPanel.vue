<template>
    <div class="mb-8">
        <p-panel-top :use-total-count="true" :total-count="items.length">
            <template>{{ $t('WORD.TAG') }}</template>
            <template #extra>
                <p-button style-type="primary-dark"
                          @click="editTag"
                >
                    {{ $t('BTN.EDIT') }}
                </p-button>
            </template>
        </p-panel-top>

        <p-data-table
            :fields="fields"
            :items="items"
            :loading="loading"
            :col-copy="true"
        />
        <s-tags-page v-if="tagEditPageVisible"
                     :resource-id="resourceId"
                     :resource-key="resourceKey"
                     :resource-type="resourceType"
                     @close="closeTag"
                     @update="updateTag"
        />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import {
    map, get, camelCase, replace,
} from 'lodash';
import { makeTrItems } from '@/lib/view-helper/index';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import STagsPage from '@/views/common/tags/TagsPage.vue';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'STagsPanel',
    components: {
        PDataTable, PPanelTop, PButton, STagsPage,
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

        const tags = ref({});
        const apiKeys = computed(() => props.resourceType.split('.').map(d => camelCase(d)));
        const api = computed(() => get(SpaceConnector.client, apiKeys.value));

        const state = reactive({
            fields: makeTrItems([
                ['name', 'WORD.KEY'],
                ['value', 'WORD.VALUE'],
            ], vm),
            loading: true,
            items: computed(() => map(tags.value, (v, k) => ({ name: k, value: v })) || []),
        });

        const tagState = reactive({
            tagEditPageVisible: false,
        });

        const getTags = async () => {
            if (!api.value) {
                tags.value = {};
                state.loading = false;
            }

            try {
                const res = await api.value.get({
                    [props.resourceKey]: props.resourceId,
                    query: { only: ['tags'] },
                });
                tags.value = res.tags;
            } catch (e) {
                tags.value = {};
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

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
