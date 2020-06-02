export const treeNodeProps = {
    level: {
        type: Number,
        default: 0,
    },
    classNames: {
        type: Array,
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    selected: {
        type: Boolean,
        default: false,
    },
    expanded: {
        type: Boolean,
        default: false,
    },
    padSize: {
        type: String,
        default: '1rem',
    },
    data: {
        type: [Array, Object, Boolean, String, Number],
        default: '',
    },
    children: {
        type: Array,
        default: undefined,
    },
};

export interface TreeNodeProps {
    level: number;
    data: any;
    padSize?: string;
    classNames?: string[];
    disabled?: boolean;
    selected?: boolean;
    expanded?: boolean;
    children?: TreeNodeProps[];
}
