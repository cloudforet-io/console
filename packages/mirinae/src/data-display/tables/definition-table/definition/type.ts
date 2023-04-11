export interface DefinitionProps {
    name: string;
    label?: string;
    data: any;
    disableCopy?: boolean;
    formatter?: (data: any, props: DefinitionProps) => any;
    block?: boolean;
    copyValue?: string|number;
    copyValueFormatter?: (data: any, props: DefinitionProps) => string|number;
    autoKeyWidth?: string;
}
