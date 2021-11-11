<template>
    <p-button-modal
        :header-title="headerTitle"
        :visible.sync="proxyVisible"
        size="sm"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p class="title">
                {{ additionalFieldState.title }}
                <span> ({{ additionalFieldState.additionalCount }})</span>
            </p>
            <p-search-dropdown
                class="search-dropdown-box"
                type="checkbox"
                :menu="additionalFieldState.additionalList"
                :selected="additionalFieldState.selectedAdditional"
                use-fixed-menu-style
                show-selected-list
                :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SEARCH_PLACEHOLDER')"
            />
            <p class="title">
                {{ tagState.title }}
                <span> ({{ tagState.selectedTagList.length }})</span>
            </p>
            <div class="search-dropdown-box">
                <p-autocomplete-search
                    v-model="tagState.tagValue"
                    :menu="tagState.tagList"
                    use-fixed-menu-style
                    show-selected-list
                    :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SEARCH_TAG_PLACEHOLDER')"
                    @keydown.enter="handleAddTag(tagState.tagValue)"
                />
                <div class="tag-box">
                    <p-tag v-for="tag in tagState.selectedTagList" :key="tag.key" @delete="handleDeleteTag(tag.key)">
                        {{ tag.key }}
                    </p-tag>
                </div>
            </div>
            <p-check-box v-model="checkBoxValue">
                <span class="ml-1">{{ checkBoxLabel }}</span>
            </p-check-box>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PButtonModal,
    PSearchDropdown,
    PCheckBox,
    PAutocompleteSearch,
    PTag,
} from '@spaceone/design-system';
import { i18n } from '@/translations';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { TranslateResult } from 'vue-i18n';

interface Tag {
    key?: string;
    label?: string | TranslateResult;
}

export default {
    name: 'CostAnalysisSetMoreModal',
    components: {
        PButtonModal,
        PSearchDropdown,
        PCheckBox,
        PAutocompleteSearch,
        PTag,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: '',
        },
    },
    setup(props, { root, emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            checkBoxValue: '',
            checkBoxLabel: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.KEEP_MY_SETTING')),
        });
        const additionalFieldState = reactive({
            title: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_ADDITIONAL_FIELD')),
            additionalList: [
                { name: '14a565a8-d519-434e-abdd-cebf367a1a78', label: 'channels', type: 'item' },
                { name: '14a565a8-d519-434e-abdd-cebf367a1c78', label: 'Internal', type: 'item' },
                { name: '93ad7053-07e1-4793-b206-900fe8f97a49', label: 'Books', type: 'item' },
                { name: 'fe2d023c-1a6b-42b0-a2fd-b05c52a72c73', label: 'alarm', type: 'item' },
                { name: '1834c7ca-66a6-48d7-bfd0-b11f8238a530', label: 'exploit', type: 'item' },
                { name: 'a2c88671-8b77-43da-850b-7936cc86ad13', label: 'bricks-and-clicks', type: 'item' },
                { name: '763ef99c-6e08-44fc-b9aa-1ec0b6eb86e4', label: 'Generic', type: 'item' },
                { name: '43c06a40-cf3e-4741-894f-c6a4b6cabce2', label: 'payment', type: 'item' },
                { name: '45f2f8b0-1f2f-4cb7-b38f-0eb2d65144fd', label: 'pink', type: 'item' },
                { name: '9acccb05-95ed-46f7-ab39-84cd0e39ed05', label: 'alarm', type: 'item' },
                { name: '7f5ce547-7a21-484b-9545-94e060b6fe64', label: 'firmware', type: 'item' },
            ],
            selectedAdditional: [],
            additionalCount: computed(() => additionalFieldState.selectedAdditional.length),
        });
        const tagState = reactive({
            title: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_TAG')),
            tagList: [{ label: 'managed_by', key: 'managed_by' }, { label: 'managed_by2', key: 'managed_by2' }] as Tag[],
            tagValue: '',
            selectedTagList: [] as Tag[],
        });

        const handleFormConfirm = () => {
            state.proxyVisible = false;
        };

        const handleAddTag = (value) => {
            let sameTag;
            const checkTag = (tags: Tag[]): boolean => tags.some((tag: Tag) => {
                sameTag = tag;
                return tag.key === value;
            });
            if (!checkTag(tagState.selectedTagList) && checkTag(tagState.tagList)) {
                tagState.selectedTagList.push(sameTag);
                tagState.tagValue = '';
            }
        };

        const handleDeleteTag = (index) => {
            tagState.selectedTagList.splice(index, 1);
        };

        return {
            ...toRefs(state),
            additionalFieldState,
            tagState,
            handleFormConfirm,
            handleAddTag,
            handleDeleteTag,
        };
    },
};

</script>


<style scoped lang="postcss">
.title {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 140%;
}
.search-dropdown-box {
    margin-top: 0.5rem;
    margin-bottom: 1.2rem;
}
.tag-box {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
    span {
        margin: 0 0.5rem 0.5rem 0;
    }
}
</style>
