### Guide

This directory contains the forms used by the collector service(create or update).

By default, the forms use "Save Collector Form" internally. So if you want to use form components, the store should be initialized.

```ts
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
```


