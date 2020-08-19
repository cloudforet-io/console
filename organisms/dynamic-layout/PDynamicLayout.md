<hr>
<br>
<br>
<br>

# Dynamic Layout Props
<br>
<hr>
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| name | ``` String ``` | ``` '' ``` | The name of layout |
| type | ``` String ``` | ``` 'item' ``` | The type of layout.<br> See supported types below. |
| options | ``` Object ``` | ``` {} ``` | Meta schema options. Different by layout type.<br> See schema options below. |
| data | ``` Object, Array ``` | ``` undefined ``` | Data to show by layout |
| fetchOptions | ``` Object ``` | ``` undefined ``` | Options for fetching data.<br> Use it only for initiating fetch options.<br> Different by layout type.<br> See fetch options by type below. |
| extra | ``` Object ``` | ``` undefined ``` | Extra props for each layout component.<br> Different by layout type.<br> See extra options by type below.|
| beforeCreate | ``` Function ``` | ``` undefined ``` | Hook that executed before create type matched component.<br> NOT supported yet. |

<br>
<br>
# Supported Types
<br>
<hr>
| Type | Description |
| ---- | ----------- |
| item | key / value |
| simple-table | table without search and pagination |
| table | table view (keyword search) |
| query-search-table | table view (query search) |
| raw | readonly monaco editor |
| markdown | - |
| list | list(<dynamic_layout>) |

<br>
<br>
# Schema Options
<br>
<hr>
| Type | Options Properties |
| ---- | ----------- |
| item | ```root_path?: string, fields: DynamicField[]``` |
| simple-table | ```root_path?: string, fields: DynamicField[]``` |
| table | ```root_path?: string, fields: DynamicField[]``` |
| query-search-table | ```root_path?: string, fields: DynamicField[]``` |
| raw | ```root_path?: string``` |
| markdown | ```markdown: string``` or <br> ```markdown: { en: string, ko: string }``` |
| list | ```layouts: DynamicLayout[]``` |

<br>
<br>
# Fetch Options
<br>
<hr>
<br>
```typescript
interface DynamicLayoutFetchOptions {
    sortBy: string;
    sortDesc: boolean;
    pageStart: number;
    pageLimit: number;
    queryTags: QueryTag[]; // See QuerySearchTags
    selectIndex: number[];
    searchText: string;
    listMap: Record<string, Partial<DynamicLayoutFetchOptions>>;
}
```

<br>
<br>
## Fetch Options by Layout Types
| Type | Fetch Options Properties |
| ---- | ----------- |
| item | - |
| simple-table | - |
| table | ```sortBy```, ```sortDesc```, ```pageStart```, ```pageLimit```, ```searchText``` |
| query-search-table | ```sortBy```, ```sortDesc```, ```pageStart```, ```pageLimit```, ```queryTags``` |
| raw | - |
| markdown | - |
| list | ```listMap``` |

<br>
<br>
# Extra Options
<br>
<hr>
<br>
```typescript
interface DynamicLayoutExtra {
    loading: boolean;
    totalCount: number;
    timezone: string;
    selectIndex: number[];
    keyItems: KeyItem[]; // See QuerySearchTable
    valueHandlerMap: ValueHandlerMap; // See QuerySearchTable
    language: string;
    listMap: Record<string, Partial<DynamicLayoutExtra>>;
}
```

<br>
<br>
## Extra Options by Layout Types
| Type | Extra Options Properties |
| ---- | ----------- |
| item | ```loading``` |
| simple-table | ```loading```, ```totalCount```, ```timezone``` |
| table |```loading```, ```totalCount```, ```timezone```, ```selectIndex``` |
| query-search-table |```loading```, ```totalCount```, ```timezone```, ```selectIndex```, ```keyItems```, ```valueHandlerMap``` |
| raw | - |
| markdown | ```language``` |
| list | ```listMap``` |

<br>
<br>
# Events
<br>
<hr>
<br>
```typescript
interface DynamicLayoutEventListeners<FetchOptions = DynamicLayoutFetchOptions> {
    init: (options: FetchOptions, layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    fetch: (options: FetchOptions,
             changedOptions: Partial<FetchOptions>,
             layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    select: (selectIndex: number[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
}
```

<br>
<br>
## Event Description
| Event Name | Description |
| ---------- | ----------- | 
| init | Emitted when the component has been created. |
| fetch | Emitted when the new 'data' must be fetched.<br> ex) when user clicked refresh button. |
| select | Emitted when row(item) has been selected. |

## Event Parameter Description
| Parameter Name | Description |
| ---------- | ----------- | 
| options | All layout fetch options. Different by layout types. |
| changedOptions | Changed fetch options. If no fetch options has been changed, empty object will be provided. Different by layout types. |
| selectIndex | Selected row(item) indexes. |
| layoutName | Name props. Only provided when layout type is 'list'. |
| layoutIndex | Layout index. Only provided when layout type is 'list'. |

## Supported Events by Layout Types
| Type | Extra Options Properties |
| ---- | ----------- |
| item | init |
| simple-table | init |
| table | init, fetch, select |
| query-search-table | init, fetch, select |
| raw | init |
| markdown | init |
| list | init, fetch, select |
