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
| typeOptions | ``` Object ``` | ``` undefined ``` | props for each layout component.<br> Different by layout type.<br> See type options by type below.|
| beforeCreate | ``` Function ``` | ``` undefined ``` | Hook that executed before create type matched component.<br> NOT supported yet. |
| beforeCreateField | ``` Function ``` | ``` undefined ``` | Hook that executed before create each dynamic field component. |
| fieldHandler | ``` Function ``` | ``` undefined ``` | handler that executed for handling dynamic field props that bound to dynamic field component. |

<br>

## What is field handler?

If you want to replace a value of particular field's ```props```, give field handler.<br>
<br>

### How field handler works?

It works only with types that have ```fields``` in ```options```.<br>
It takes ```DynamicField``` as a parameter and returns ```Partial<DynamcField>```.<br>
The ```props``` binding to DynamicField component will be merged with returned object. <br>

<br>

## Parameter of field handler

```extraData``` of ```DynamicField``` is all data of the ```field```.<br>
For example, if the given ```fields``` are as follows,<br>

```json5
[
  { key: 'first', name: 'First', type: 'text', hello: 'world' },
  { key: 'second', name: 'Second', type: 'text', hello: 'foo', hi: 'spaceOne' }
]
``` 

the handler will be executed twice.<br>
each handler's parameter will be each item.<br>

## Field handler doesn't work recursively

In case of ```enum``` or ```list``` type, it can also have DynamicField as children.<br>
In these cases, field handler doesn't work with the children fields.<br>  
It will be invoked only at the parent level.<br>
For example, <br>

```json5
[
  {key: 'parent', name: 'Parent', type: 'enum', options: {
      first: {type: 'badge', ...}, second: {type: 'badge', ...},
    }
  }
]
```
<br>
in this case, field handler will be invoked once with parent item.<br>



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
| raw |
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
interface DynamicLayoutTypeOptions {
    loading: boolean;
    totalCount: number;
    timezone: string;
    selectIndex: number[];
    selectable: boolean;
    keyItemSets: KeyItemSet[]; // See QuerySearchTable
    valueHandlerMap: ValueHandlerMap; // See QuerySearchTable
    language: string;
    listMap: Record<string, Partial<DynamicLayoutTypeOptions>>;
}
```

<br>
<br>

## Type Options Description
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| loading | boolean | ```false``` | Used to display loading spinner. |
| totalCount | number | ```0``` | Used to calculate pagination, displaying count next to the title. |
| timezone | string |```'UTC'``` | Used to display datetime. |
| selectIndex | number[] |```[]``` | Used to initiate selectIndex of tables. Works only 'selectable' is ```true``` |
| selectable | boolean | ```false``` | Used to make tables selectable. |
| keyItemSets | KeyItemSet[] |```options.fields``` or ```[]``` | Only for query-search-table's key items. |
| valueHandlerMap | ValueHandlerMap |```{}``` | Only for query-search-table's value handler map. |
| language | string | ```'en'``` | NOT supported yet except markdown type. |
| listMap | Record<string, Partial<DynamicLayoutTypeOptions>> | ```{}``` | Only for list type. Give layout's name as key, and type options as value. If value is ```undefined```, other type options will be automatically bound to each component. |

<br>
<br>

## Type Options by Layout Types
| Type | Type Options Properties |
| ---- | ----------- |
| item | ```loading``` |
| simple-table | ```loading```, ```totalCount```, ```timezone``` |
| table |```loading```, ```totalCount```, ```timezone```, ```selectIndex```, ```selectable``` |
| query-search-table |```loading```, ```totalCount```, ```timezone```, ```selectIndex```, ```selectable```, ```keyItemSets```, ```valueHandlerMap``` |
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
    export: (options: FetchOptions, fields: DynamicField[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
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
| export | Emitted when clicked export button. |

## Event Parameter Description
| Parameter Name | Description |
| ---------- | ----------- | 
| options | All layout fetch options. Different by layout types. |
| changedOptions | Changed fetch options. If no fetch options has been changed, empty object will be provided. Different by layout types. |
| selectIndex | Selected row(item) indexes. |
| layoutName | Name props. Only provided when layout type is 'list'. |
| layoutIndex | Layout index. Only provided when layout type is 'list'. |
| fields (export) | Fields for exported csv/excel columns.  |

## Supported Events by Layout Types
| Type | Type Options Properties |
| ---- | ----------- |
| item | init |
| simple-table | init |
| table | init, fetch, select, export |
| query-search-table | init, fetch, select, export |
| raw | init |
| markdown | init |
| list | init, fetch, select |
