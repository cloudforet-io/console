import { ModalThemeColor } from '@/organisms/modals/content-modal/type';
import { ModalProps } from '@/molecules/modals/type';


export interface TableCheckModalProps extends ModalProps {
    mode: string;
    items: any[];
    fields: string[];
    action: any;
    headerTitle: string;
    subTitle: string;
    themeColor: ModalThemeColor;
}
