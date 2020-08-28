export interface DefinitionProps {
    name: string;
    label?: string;
    data: any;
    disableCopy?: boolean;
    formatter?: (data: any, props: DefinitionProps) => string;
}
