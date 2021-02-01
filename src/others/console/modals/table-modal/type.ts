import { ModalThemeColor } from '@/feedbacks/modals/content-modal/type';
import { ModalProps } from '@/feedbacks/modals/modal/type';


export interface TableCheckModalProps extends ModalProps {
    mode: string;
    items: any[];
    fields: string[];
    action: any;
    headerTitle: string;
    subTitle: string;
    themeColor: ModalThemeColor;
}
