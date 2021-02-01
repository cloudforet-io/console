import {
    ProgressTabBarProps,
} from '@/navigation/wizards/progress-wizard/progress-tab-bar/type';

export interface ProgressWizardProps extends ProgressTabBarProps {
    cancelBtnBind: any;
    navigationBtnBind: any;
    confirmBtnBind: any;
    loading: boolean;
    disabled: boolean;
}
