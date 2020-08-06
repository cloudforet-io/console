### Types

```typescript
import { DataTableFieldType } from 'DataTable';
import { KeyItem, ValueHandlerMap } from 'QuerySearch';
import { QueryTag } from 'QuerySearchTags';

export interface QuerySearchTableProps {
    fields: DataTableFieldType[];
    items: any[];
    loading: boolean;
    sortBy: string; // sync
    sortDesc: boolean; // sync
    selectIndex: number[]; // sync
    thisPage: number; // sync
    pageSize: number; // sync
    totalCount: number;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    queryTags: QueryTag[];
}

interface Options {
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    queryTags: QueryTag[];
}

interface listeners {
    // Emitted when options are changed
    change?: (options: Readonly<Options>, changedOptions: Readonly<Options>) => void|Promise<void>;
    export?: () => void|Promise<void>;
    select?: (selectIndex: number[]) => void|Promise<void>;
}

```
