# Dynamic Layout : List Type

## sample schema
```json
{
    "name": "List Data",
    "type": "list",
    "options": {
      "layouts": []
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
| layouts   | list of dynamic layouts   | array         |

## support data type
| props | support? |
|-------|----------|
| data  | O(bypass)|
| api   | O(bypass)|
|toolset|  X       |

## props(v-bind)

additional config
