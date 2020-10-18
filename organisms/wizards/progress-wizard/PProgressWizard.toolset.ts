import {
    ProgressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/type';

export const progressWizardProps = {
    tabs: {
        type: Array,
        default: () => [],
    },
    /** sync */
    activeIdx: {
        type: Number,
        default: 0,
    },
    invalidState: {
        type: Object,
        default: () => ({}),
    },
    cancelBtnBind: {
        type: Object,
        default: () => ({}),
    },
    navigationBtnBind: {
        type: Object,
        default: () => ({}),
    },
    confirmBtnBind: {
        type: Object,
        default: () => ({}),
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
};

export interface ProgressWizardProps extends ProgressTabBarProps {
    cancelBtnBind: any;
    navigationBtnBind: any;
    confirmBtnBind: any;
    loading: boolean;
    disabled: boolean;
}
