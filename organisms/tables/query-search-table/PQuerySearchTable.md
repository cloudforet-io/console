
# Slots

* All ToolboxTable component's slots.
* All QuerySearchTags component's slots with prefix ```tag```. (e.g. ```tag-data-type-datetime```)

# Functions
| Name | Description |
| ---- | ----------- |
| addTag | Use it when you want to add tag. <br> It takes ```QueryItem``` as parameters. |
| deleteTag | Use it when you want to delete one tag. Give the index you want to delete as a parameter. |
| deleteAllTags | Use it when you want to delete all tags. |

```typescript
interface QuerySearchTableFunctions {
    addTag(...queries: QueryItem[]): void;
    deleteTag(index: number): void;
    deleteAllTags(): void;
}
```

### Types

```typescript
import { DataTableFieldType } from 'DataTable';
import { KeyItemSet, ValueHandlerMap } from 'QuerySearch';
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
    keyItemSets: KeyItemSet[];
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
