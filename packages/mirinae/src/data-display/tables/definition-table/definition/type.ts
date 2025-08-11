import type { TranslateResult } from 'vue-i18n';

export interface DefinitionProps {
    name: string;
    label?: TranslateResult;
    data: string|boolean|number|object|undefined;
    disableCopy?: boolean;
    formatter?: (data: any, props: DefinitionProps) => any;
    block?: boolean;
    copyValue?: string|number|Array<any>;
    copyValueFormatter?: (data: any, props: Readonly<Partial<DefinitionProps>>) => string|number;
    autoKeyWidth?: boolean;
    customKeyWidth?: string;
}
