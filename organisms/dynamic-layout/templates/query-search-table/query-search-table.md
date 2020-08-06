```typescript
import { QuerySearchTableProps } from 'QuerySearchTable';
import { DynamicLayoutTemplateProps, QuerySearchTableOptions } from 'DynamicLayout';

export type QuerySearchDynamicLayoutProps = DynamicLayoutTemplateProps<
    Partial<QuerySearchTableProps>,
    QuerySearchTableOptions,
    >

```
