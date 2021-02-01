
Query Search is <b>```key:value``` format search.</b> <br>
It provides <b>autocomplete for keys and values.</b> <br>
Also, you can give an <b>operator</b> between key and value. <br>

## How autocomplete works?
Autocomplete list format is an array of ```{name: string; label: string;}```. <br>
```name``` is actual value, and ```label``` is display value.<br>
If ```label``` or ```name``` contain the value you entered, it exposes the ```label``` to autocomplete list.<br>

### Key autocomplete
You can give key autocomplete list as ```keyItemSets``` props.<br>
```keyItemSets``` are a set if title and key items.<br>
key items are an array of ```{name, label, dataType}```.<br>
```dataType``` is optional. <br>
This is used to determine the browser input form to be displayed to the user.<br>
It's NOT used for validation, only for input form determination. <br>

#### Support data type
- string(default)
- integer
- float
- boolean
- datetime
- object

#### HTML input type for each data type
| Data Type | HTML Input Type |
| --------- | --------------- |
| string(default) | text |
| integer | number |
| float | number |
| boolean | text |
| datetime | text |
| object(key) | text |
| object(value) | text |

### Value autocomplete
Value autocomplete list can be different by selected key item.<br>
Also, for every key, you may want to display a list in a different way.<br>
So you just can give handler functions for each key as ```valueHandlerMap``` props.<br>

#### What is value handler map?
A value handler map is an object.<br>
The properties must be one of the name of key items.<br>
The value must be a ```HandlerResp``` or ```undefined```.<br>
<br>
```HandlerResp``` format:
``` 
{
    results: ValueItem[];
    totalCount?: number;
}
```
<br>

The ```ValueItem``` is ```{name: string; label: string;}```. <br>
The value handler can return promise. <br>

#### What if there's no matched value handler?
The value handler can be ```undefined```.<br>
Then, the default value handler will be automatically run.<br>
It runs differently for each selected key item's data type.<br>

 | Data Type | How It Works |
 | --------- | --------------- |
 | string | No value autocomplete. |
 | integer | No value autocomplete. browser ```number``` input form will be given with ```step``` 1 and ```min``` 0. |
 | float | No value autocomplete. browser ```number``` input form will be given. |
 | boolean | TRUE/FALSE ```text``` autocomplete. |
 | datetime | Operator autocomplete will be given. No value autocomplete. There will be value validation. |
 | object | No value autocomplete. |

## Support operators.
'!', '>', '>=', '<', '<=', '=', '!=', '$'
