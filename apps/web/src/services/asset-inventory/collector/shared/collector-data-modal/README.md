### Guide

This directory contains modal forms for re-collecting the collector.

By default, the components use the information of the selected item when the modal is activated.
Therefore, in order to use the components, the relevant information should be stored in the store.

```ts
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';

const collectorDataModalStore = useCollectorDataModalStore();
```


