```typescript
import { QuerySearchTableProps } from 'QuerySearchTable';
import { DynamicLayoutTemplateProps, QuerySearchTableOptions } from 'DynamicLayout';

export type QuerySearchDynamicLayoutProps<T=any> = DynamicLayoutTemplateProps<
    Partial<QuerySearchTableProps>,
    QuerySearchTableOptions,
    T[]
    >

```
