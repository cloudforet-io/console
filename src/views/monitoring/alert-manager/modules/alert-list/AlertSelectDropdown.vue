<template>
    <fragment>
        <p-autocomplete-search :menu="menuItems"
                               use-fixed-menu-style
                               :class="{invalid}"
                               @select-menu="onSelectAlert"
        >
            <template #menu-item--format="{item, id}">
                <p-radio :id="id" :selected="selectedItem.alert_id"
                         class="tag-menu-item"
                         :value="item.name"
                         @change="onSelectAlert(item)"
                >
                    {{ item.label }}
                </p-radio>
            </template>
        </p-autocomplete-search>
        <p-tag v-if="selectedLabel" @delete="onDeleteTag">
            {{ selectedLabel }}
        </p-tag>
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { isEmpty } from 'lodash';
import {
    PAutocompleteSearch, PRadio, PTag,
} from '@spaceone/design-system';

import { TAGS_PREFIX } from '@/common/modules/custom-field-modal/config';
import { makeProxy } from '@/core-lib/compostion-util';

export default {
    name: 'AlertSelectDropdown',
    components: {
        PAutocompleteSearch,
        PTag,
        PRadio,
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        selected: {
            type: Object,
            default: () => ({}),
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            selectedItem: makeProxy('selected', props, emit),
            selectedLabel: computed(() => (isEmpty(state.selectedItem) ? '' : `#${state.selectedItem.alert_number} ${state.selectedItem.title}`)),
            menuItems: computed(() => props.items.map(d => ({
                name: d.alert_id,
                label: `#${d.alert_number} ${d.title}`,
            }))),
        });

        const onDeleteTag = () => {
            state.selectedItem = {};
        };

        const onSelectAlert = (item) => {
            state.selectedItem = props.items.find(d => d.alert_id === item.name) ?? {};
        };

        return {
            ...toRefs(state),
            onDeleteTag,
            onSelectAlert,
            TAGS_PREFIX,
        };
    },
};
</script>

<style lang="postcss" scoped>
.tag-menu-item.p-radio::v-deep {
    @apply bg-transparent;
    display: flex;
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    .radio-icon {
        flex-shrink: 0;
        margin-right: 0.5rem;
        margin-top: 0.125rem;
    }
    &:hover {
        @apply bg-blue-200;
    }
    .text {
        word-break: break-word;
        white-space: normal;
    }
}
.p-autocomplete-search::v-deep {
    &.invalid {
        .p-search {
            @apply border border-alert;
        }
        .p-context-menu {
            @apply border border-alert;
        }
    }
    .p-context-menu {
        max-height: 50vh;
        .context-item:not(.empty) {
            padding: 0;
            white-space: unset;
            .text {
                max-width: calc(100% - 1.5rem);
            }
        }
        .fake-no-data {
            height: 1rem;
        }
    }
}
.p-tag {
    margin-top: 0.625rem;
    margin-bottom: 0.5rem;
}
</style>
