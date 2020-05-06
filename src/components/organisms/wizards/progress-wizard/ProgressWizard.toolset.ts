import {
    progressTabBarProps,
    ProgressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar.toolset';

export const progressWizardProps = {
    ...progressTabBarProps,
    title: {
        type: String,
        default: undefined,
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
};

export interface ProgressWizardProps extends ProgressTabBarProps {
    title: string;
    cancelBtnBind: any;
    navigationBtnBind: any;
    confirmBtnBind: any;
}
