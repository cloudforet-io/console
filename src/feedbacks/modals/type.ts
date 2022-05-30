export enum SizeMapping {
    sm = 'modal-sm',
    md = '',
    lg = 'modal-lg',
    xl = 'modal-xl',
}
export type ModalSizeType = keyof typeof SizeMapping;

export interface ModalProps {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
    visible: boolean; // sync
    backdrop: boolean;
}
