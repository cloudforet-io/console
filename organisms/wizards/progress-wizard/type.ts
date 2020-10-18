import {
    ProgressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/type';

export interface ProgressWizardProps extends ProgressTabBarProps {
    cancelBtnBind: any;
    navigationBtnBind: any;
    confirmBtnBind: any;
    loading: boolean;
    disabled: boolean;
}
