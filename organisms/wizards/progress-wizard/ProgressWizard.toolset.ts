import {
    progressTabBarProps,
    ProgressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/PProgressTabBar.toolset';

export const progressWizardProps = {
    ...progressTabBarProps,
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
