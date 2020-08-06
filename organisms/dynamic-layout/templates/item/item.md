```typescript
import { DynamicLayoutTemplateProps, ItemOptions } from 'DynmaicLayout';
import { DefinitionTableProps } from 'DefinitionTable';

export type ItemDynamicLayoutProps = DynamicLayoutTemplateProps<
    Partial<DefinitionTableProps>,
    ItemOptions,
    >

```
