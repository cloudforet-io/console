# Dynamic Layout : Raw Type

## sample schema
```json
{
    "name": "Raw Data",
    "type": "raw",
    "options": {
      "root_path": ""
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

## support data type
| props | support? |
|-------|----------|
| data  |  O       |
| api   |  O(get)  |
|toolset|  X       |

## props(v-bind)

additional config
