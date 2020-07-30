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
            :col-copy="true"
        />
        <s-tags-page
            v-if="tagEditPageVisible"
            :resource-id="resourceIdValue"
            @close="closeTag"
            @update="updateTag"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { map, debounce } from 'lodash';
import { makeTrItems } from '@/lib/view-helper/index';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import STagsPage from '@/views/common/tags/TagsPage.vue';

export default {
    name: 'STagsPanel',
    components: {
        PDataTable, PPanelTop, PButton, STagsPage,
    },
    props: {
        action: {
            type: Object,
            default: null,
        },
        resourceId: {
            type: [String, Object],
            default: '',
        },
        tagPageName: {
            type: String,
            required: true,
        },
        isShow: {
            type: Boolean,
            required: true,
        },
    },
    setup(props, context) {
        const vm: any = getCurrentInstance();

        const state = reactive({
            parentRouter: computed(() => vm?.$route.matched[vm?.$route.matched.length - 2]),
            resource: computed(() => state.parentRouter?.meta),
            api: computed(() => props.action || state.resource?.api),
            fields: makeTrItems([
                ['name', 'WORD.KEY'],
                ['value', 'WORD.VALUE'],
            ], vm),
            tags: {},
            items: computed(() => map(state.tags, (v, k) => ({ name: k, value: v })) || []),
            resourceIdValue: props.resourceId,
        });
        const tagState = reactive({
            tagEditPageVisible: false,
        });
        const getTagData = debounce(async () => {
            state.tags = {};
            const resp = await state.api.get().setId(props.resourceId).setOnly('tags').execute();
            state.tags = resp.data.tags;
        }, 200);

        const editTag = async () => {
            tagState.tagEditPageVisible = true;
        };
        const closeTag = async () => {
            console.debug('close');
            tagState.tagEditPageVisible = false;
        };
        const updateTag = async () => {
            await getTagData();
            tagState.tagEditPageVisible = false;
        };
        onMounted(async () => {
            if (props.isShow && props.resourceId) {
                await getTagData();
            }
        });
        watch(() => props.resourceId, async (after, before) => {
            if (props.isShow && after && after !== before) {
                await getTagData();
            }
        });
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
