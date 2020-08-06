import { DynamicLayoutTemplateProps, ItemOptions } from '@/components/organisms/dynamic-layout/type';
import { DefinitionData, DefinitionTableProps } from '@/components/organisms/tables/definition-table/type';

export type ItemDynamicLayoutProps<T=any> = DynamicLayoutTemplateProps<
    Partial<DefinitionTableProps>,
    ItemOptions,
    DefinitionData
    >
