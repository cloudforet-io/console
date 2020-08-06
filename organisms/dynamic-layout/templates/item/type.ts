import { DynamicLayoutTemplateProps, ItemOptions } from '@/components/organisms/dynamic-layout/type';
import { DefinitionTableProps } from '@/components/organisms/tables/definition-table/type';

export type ItemDynamicLayoutProps = DynamicLayoutTemplateProps<
    Partial<DefinitionTableProps>,
    ItemOptions
    >
