import {
    ListOptions,
    DynamicLayoutTemplateProps,
} from '@/components/organisms/dynamic-layout/type';
import { MarkdownDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/markdown/type';
import { RawDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/raw/type';
import { ItemDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/item/type';
import { QuerySearchDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { TableDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/table/type';
import { SimpleTableDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/simple-table/type';

type AllTypeInitProps = Partial<MarkdownDynamicLayoutProps>
| Partial<RawDynamicLayoutProps>
| Partial<ItemDynamicLayoutProps>
| Partial<QuerySearchDynamicLayoutProps>
| Partial<TableDynamicLayoutProps>
| Partial<SimpleTableDynamicLayoutProps>

export type ListDynamicLayoutProps = DynamicLayoutTemplateProps<
    Record<string, AllTypeInitProps>,
    ListOptions
>
