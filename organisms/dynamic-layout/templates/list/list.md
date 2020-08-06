```typescript
import {
    ListOptions,
    DynamicLayoutOptions,
    DynamicLayoutProps,
    DynamicLayoutTemplateProps,
} from 'DynamicLayout';

export type ListDynamicLayoutProps = DynamicLayoutTemplateProps<
    DynamicLayoutProps<any, DynamicLayoutOptions>,
    ListOptions,
>

```
