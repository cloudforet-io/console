import { ModalThemeColor } from '@/feedbacks/modals/button-modal/type';
import { ModalProps } from '@/feedbacks/modals/type';


export interface TableCheckModalProps extends ModalProps {
    mode: string;
    items: any[];
    fields: string[];
    action: any;
    headerTitle: string;
    subTitle: string;
    themeColor: ModalThemeColor;
}
