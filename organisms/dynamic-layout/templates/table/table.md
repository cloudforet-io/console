```typescript
import { DynamicLayoutTemplateProps, TableOptions } from 'DynamicLayout';
import { ToolboxTableProps } from 'ToolboxTable';

export interface SearchTableProps extends ToolboxTableProps {
    searchText: string;
}

export type TableDynamicLayoutProps = DynamicLayoutTemplateProps<
    SearchTableProps,
    TableOptions
    >

```
