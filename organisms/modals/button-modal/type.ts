import { Button } from '@/components/atoms/buttons/type';
import { ContentModalProps } from '@/components/organisms/modals/content-modal/type';

export interface ButtonModalProps extends ContentModalProps {
    headerTitle: string;
    headerCloseButtonVisible: boolean;
    footerCancelButtonVisible: boolean;
    footerConfirmButtonVisible: boolean;
    footerCancelButtonBind: Button ;
    footerConfirmButtonBind: Button;
    hideOnCancel: boolean;
    loading: boolean;
    disabled: boolean;
}
