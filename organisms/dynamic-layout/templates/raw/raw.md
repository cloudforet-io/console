```typescript
import { DynamicLayoutTemplateProps, RawOptions } from 'DynamicLayout';
import { RawDataProps } from 'RawData';

export type RawDynamicLayoutProps = DynamicLayoutTemplateProps<
        Partial<RawDataProps>,
        RawOptions
    >

```
