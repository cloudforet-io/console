import type { MenuItem } from '@/inputs/context-menu/type';

export interface InputItem extends MenuItem {
    name: string;
}

export const INPUT_SIZE = {
    sm: 'sm',
    md: 'md',
} as const;
export type InputSize = typeof INPUT_SIZE[keyof typeof INPUT_SIZE];


export const INPUT_APPEARANCE_TYPES = ['basic', 'stack', 'badge', 'masking'] as const;
export type InputAppearanceType = typeof INPUT_APPEARANCE_TYPES[number];

export interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface TextInputHandler {
    (inputText: string, pageStart?: number, pageLimit?: number): Promise<HandlerRes>|HandlerRes;
}
