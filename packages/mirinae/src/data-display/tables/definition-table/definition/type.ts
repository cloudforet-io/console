import type { TranslateResult } from 'vue-i18n';

export interface DefinitionProps {
    name: string;
    label?: TranslateResult;
    data: any;
    disableCopy?: boolean;
    formatter?: (data: any, props: DefinitionProps) => any;
    block?: boolean;
    copyValue?: string|number;
    copyValueFormatter?: (data: any, props: DefinitionProps) => string|number;
    autoKeyWidth?: boolean;
    customKeyWidth?: string;
}
