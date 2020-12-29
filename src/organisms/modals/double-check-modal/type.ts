import { ModalThemeColor } from '@/organisms/modals/content-modal/type';


export interface PDoubleCheckModalProps {
    verificationText: string;
    hideOnCancel: boolean;
    headerTitle: string;
    subTitle: string;
    themeColor: ModalThemeColor;
}
