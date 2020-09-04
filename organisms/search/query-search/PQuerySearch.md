## types
```typescript

const inputDataTypes = {
    string: 'text',
    integer: 'number',
    float: 'number',
    boolean: 'text',
    datetime: 'datetime-local',
};

type KeyDataType = keyof typeof inputDataTypes;

interface KeyItem {
    label: string;
    name: string;
    dataType?: KeyDataType;
}

const operators = ['!', '>', '>=', '<', '<=', '=', '!=', '$'];
type OperatorType = typeof operators[number];

interface ValueItem<T=string> {
    label: string;
    name: T;
    icon?: string;
    link?: string;
    target?: string;
}

interface QueryItem<T=string> {
    key?: KeyItem;
    operator: OperatorType;
    value: ValueItem<T>;
}

interface HandlerResponse {
    results: ValueItem[];
    totalCount?: number;
}
type ValueHandler = (inputText: string, keyItem: KeyItem) => Promise<HandlerResponse>|HandlerResponse;

interface ValueHandlerMap {
    [key: string]: ValueHandler|undefined;
}

interface QuerySearchProps {
    placeholder: string;
    focused: boolean;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    value: string;
}

interface QuerySearchListeners {
    search?: (query: QueryItem) => Promise<void>|void;
}


```
## Support data type
- string(default)
- integer
- float
- boolean
- datetime

## HTML input type for each data type
| Data Type | HTML Input Type |
| --------- | --------------- |
| string(default) | text |
| integer | number |
| float | number |
| boolean | text |
| datetime | datetime-local |

## What is value handler map?
Value handler map is key:value object.
The key must be an item of key item's name.
The value handler must be a function that returns value item results and total count.
The value handler can return promise.

## What if there's no matched value handler?
It works differently for each data type.

 | Data Type | How It Works |
 | --------- | --------------- |
 | string, integer, float | No value autocomplete. |
 | boolean | TRUE/FALSE text autocomplete. |
 | datetime | No value autocomplete. browser datetime-local input form will be given. |
