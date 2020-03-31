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
    mustSelect: {
        type: Boolean,
        default: true,
    },
    defaultIcon: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
};

interface MapperType {
    key: string;
    iconUrl: string;
    title: string;
}

interface SelectableListType {
    items: SelectableItemPropsType[];
    mapper: MapperType;
    multiSelectable?: boolean;
    mustSelect?: boolean;
    defaultIcon?: string;
    loading?: boolean;
}

interface SelectableListSyncType {
    selectedIndexes: number[];
    disabledIndexes: number[];
}
export interface SelectableListPropsType extends SelectableListType, SelectableListSyncType {}
