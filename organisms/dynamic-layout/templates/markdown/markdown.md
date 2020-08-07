```typescript
import { DynamicLayoutTemplateProps, MarkdownOptions } from 'DynamicLayout';
import { MarkdownProps } from 'Markdown';

export type MarkdownDynamicLayoutProps = DynamicLayoutTemplateProps<
    Partial<MarkdownProps>,
    MarkdownOptions
    >

```
