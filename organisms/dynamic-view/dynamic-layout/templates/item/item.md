# Dynamic Layout : Item Type

## sample schema
```json
{
    "name": "EC2 Instance",
    "type": "item",
    "options": {
        "root_path": "data.compute",
        "fields": [
            {
              "name": "Instance ID",
              "key": "instance_name"
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

#### options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |
| fields    | dynamic form fields | DynamicField[] |

## support data type
| props | support? |
|-------|----------|
| data  |  O       |
| api   |  O(get)  |
|toolset|  X       |

## props(v-bind)

additional config
