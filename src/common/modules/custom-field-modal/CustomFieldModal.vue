<template>
    <p-button-modal :visible.sync="proxyVisible" :header-title="$t('COMMON.CUSTOM_FIELD_MODAL.TITLE')">
        <template #body>
            <section class="modal-wrapper">
                <article class="attribute-column">
                    <h3 class="column-name">
                        Attribute columns
                    </h3>
                    <h4 class="column-desc">
                        <span class="text">Select visible attribute columns</span>
                        <p-button class="button gray900 sm" :outline="true">
                            Default
                        </p-button>
                    </h4>
                    <p-search v-model="search" class="p-search" :placeholder="'Search attribute columns'"
                              @search="$emit('search', $event)"
                    />
                    <p-data-table
                        :loading="loading"
                        :fields="fields"
                        :items="items"
                        selectable
                    />
                </article>
                <article class="tag-column">
                    <h3 class="column-name">
                        Tag columns
                    </h3>
                    <h4 class="column-desc">
                        <span>Select visible tag columns</span>
                        <p-button class="button gray900 sm" :outline="true">
                            Clear all
                        </p-button>
                    </h4>
                    <p-select-dropdown v-model="selectedTag"
                                       :items="tagList"
                                       auto-height
                                       :placeholder="'Select tags'"
                    />
                </article>
            </section>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PButton,
    PButtonModal, PDataTable, PSearch, PSelectDropdown,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

interface Props {
    visible: boolean;
}
export default {
    name: 'CustomFieldModal',
    components: {
        PButtonModal,
        PSearch,
        PDataTable,
        PSelectDropdown,
        PButton,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            search: '',
            fields: [
                { label: 'Column Name', name: 'column_name' },
            ],
            items: [],
            loading: false,
            totalCount: 0,
            selectedTag: '',
            tagList: [],
        });
        return { ...toRefs(state) };
    },
};
</script>

<style lang="postcss" scoped>
.modal-wrapper {
    display: flex;
    width: 100%;
    .attribute-column {
        width: 50%;
        flex-shrink: 0;
        padding-right: 2rem;
        .p-search {
            margin-bottom: 0.531rem;
        }
    }
    .tag-column {
        width: 50%;
        flex-shrink: 0;
    }
    .column-name {
        @apply text-gray-900;
        font-size: 1.125rem;
        line-height: 155%;
        margin-bottom: 0.25rem;
    }
    .column-desc {
        @apply text-gray-500;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        line-height: 120%;
        margin-bottom: 1.25rem;
        .button {
            font-size: 0.75rem;
            line-height: 150%;
            font-weight: bold;
            height: 1.25rem;
            border-radius: 0.25rem;
        }
    }
}
</style>
