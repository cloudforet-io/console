```typescript
import { DynamicLayoutTemplateProps, ItemOptions } from 'DynmaicLayout';
import { DefinitionData, DefinitionTableProps } from 'DefinitionTable';

export type ItemDynamicLayoutProps<T=any> = DynamicLayoutTemplateProps<
    Partial<DefinitionTableProps>,
    ItemOptions,
    DefinitionData
    >

```
