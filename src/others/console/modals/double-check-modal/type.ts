import { ModalThemeColor } from '@/feedbacks/modals/button-modal/type';

export interface PDoubleCheckModalProps {
    verificationText: string;
    hideOnCancel: boolean;
    headerTitle: string;
    subTitle: string;
    themeColor: ModalThemeColor;
}
