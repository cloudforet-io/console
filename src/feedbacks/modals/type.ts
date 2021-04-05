export enum sizeMapping {
    sm = 'modal-sm',
    md = '',
    lg = 'modal-lg',
    xl = 'modal-xl',
}
export type ModalSizeType = keyof typeof sizeMapping;

export interface ModalProps {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
    visible: boolean; // sync
    backdrop: boolean;
}
