<script setup lang="ts">
import { PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

interface Props {
    selected?: SelectDropdownMenuItem[];
    menuHandlers?: AutocompleteHandler[];
    invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    selected: undefined,
    menuHandlers: undefined,
    invalid: false,
});

const emit = defineEmits<{(e: 'update:selected', selected: SelectDropdownMenuItem[]): void;
    (e: 'delete'): void;
}>();

const handleUpdateSelected = (selected: SelectDropdownMenuItem[]) => {
    emit('update:selected', selected);
};
</script>

<template>
    <!-- TODO: will be updated-->
    <div class="select-form-wrapper">
        <p-select-dropdown use-fixed-menu-style
                           is-fixed-width
                           is-filterable
                           multi-selectable
                           :handler="props.menuHandlers"
                           :selected="props.selected"
                           :invalid="props.invalid"
                           @update:selected="handleUpdateSelected"
        >
            <template #dropdown-button>
                <div class="dropdown-inner">
                    <span class="item-label">{{ props.selected?.[0]?.label }}</span>
                    <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                </div>
            </template>
        </p-select-dropdown>
        <p-icon-button class="delete-button"
                       shape="square"
                       style-type="negative-secondary"
                       name="ic_delete"
                       @click="emit('delete')"
        />
    </div>
</template>
