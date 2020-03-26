import { SelectableItemPropsType } from '@/components/molecules/selectable-item/SelectableItem.toolset';

export const selectableListProps = {
    items: {
        type: Array,
        default: () => [],
    },
    /* sync */
    selectedIndexes: {
        type: Array,
        default: () => [],
    },
    /* sync */
    disabledIndexes: {
        type: Array,
        default: () => [],
    },
    mapper: {
        type: Object,
        required: true,
    },
    multiSelectable: {
        type: Boolean,
        default: true,
    },
};

interface MapperType {
    key: string;
    icon: string;
    title: string;
}

interface SelectableListType {
    items: SelectableItemPropsType[];
    mapper: MapperType;
    multiSelectable?: boolean;
}

interface SelectableListSyncType {
    selectedIndexes: number[];
    disabledIndexes: number[];
}
export interface SelectableListPropsType extends SelectableListType, SelectableListSyncType {}
