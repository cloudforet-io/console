# Dynamic Layout : Table Type

## sample schema
```json
{
    "name": "Security Group Rules",
    "type": "table",
    "options": {
        "root_path": "data.security_group_rules",
        "fields": [
            {
                "name": "Name",
                "key": "security_group_name"
            }
        ]
    }
}
``` 
## properties

### default properties
| keyword | Definition                       | Data Type |
|---------|----------------------------------|-----------|
| name    | layout name use in tab and title | str       |
| type    | layout type                      | str       |
| options |                                  | dict      |

### options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |
| fields    | dynamic form fields | DynamicField[] |

## data type
| props | support? |
|-------|----------|
| data  |  X       |
| api   |  O(get-data,list)       |
|toolset|  O       |


## props(v-bind)

additional config



