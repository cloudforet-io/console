<template>
    <div
        class="manage-wrapper"
    >
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_NAME')"
                       required
        >
            <p-text-input v-model="name" />
        </p-field-group>
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_SELECTION_TYPE')"
                       required
        >
            <p-select-dropdown />
        </p-field-group>
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.LABEL_OPTIONS')"
                       required
        >
            <div class="options-wrapper">
                <p-button class="option-add-button"
                          icon-left="ic_plus"
                          style-type="secondary"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD_OPTIONS') }}
                </p-button>
                <draggable :list="options"
                           class="draggable-wrapper"
                           ghost-class="ghost"
                >
                    <div v-for="(option, idx) in options"
                         :key="`drag-item-${option.name}-${idx}`"
                         class="draggable-item"
                    >
                        <p-i class="grab-area"
                             name="ic_drag-handle--slim"
                             width="1rem"
                             height="1rem"
                        />
                        <p-text-input class="option-input"
                                      :value="option.label"
                                      :placeholder="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.PLACEHOLDER_OPTIONS')"
                        />
                        <div class="option-delete-area">
                            <p-icon-button v-if="options.length > 1"
                                           name="ic_trashcan"
                            />
                        </div>
                    </div>
                </draggable>
            </div>
        </p-field-group>
        <div class="button-wrapper">
            <p-button style-type="tertiary">
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.CANCEL') }}
            </p-button>
            <p-button>
                {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.SAVE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PFieldGroup, PIconButton, PSelectDropdown, PTextInput, PI,
} from '@spaceone/design-system';

export default defineComponent({
    name: 'DashboardManageVariableForm',
    components: {
        PButton,
        PFieldGroup,
        PIconButton,
        PSelectDropdown,
        PTextInput,
        PI,
        draggable,
    },
    setup() {
        const state = reactive({
            name: '',
            selectionType: 'MULTI',
            options: [
                { name: 'a', label: 'a-test' },
                { name: 'b', label: 'b-test-test' },
                { name: 'c', label: 'c-test-test-test' },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
});

</script>

<style lang="postcss" scoped>
.manage-wrapper {
    padding: 0 1rem 1rem;

    .options-wrapper {
        @apply bg-gray-100 rounded-md;
        padding: 0.5rem;

        .option-add-button {
            margin-bottom: 0.5rem;
        }
        .draggable-wrapper {
            @apply border border-gray-200 rounded flex flex-col bg-white;
            padding: 0.75rem 0.375rem;
            gap: 0.5rem;
            .draggable-item {
                @apply flex items-center bg-white;
                .grab-area {
                    cursor: grab;
                    &:active {
                        cursor: grabbing;
                    }
                }
                .option-input {
                    @apply w-full;
                }
                .option-delete-area {
                    width: 2rem;
                    height: 2rem;
                }
            }
            .ghost {
                @apply bg-blue-200;
            }
        }
    }
    .button-wrapper {
        @apply flex w-full;
        gap: 1rem;
        padding-top: 1rem;
    }
}
</style>
