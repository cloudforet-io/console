# support view-layout
- [X] item : key / value 
- [ ] table: table view (api base, keyword search)
- [ ] query-search-table: table view (api base, query search)
- [ ] simple-table: table without search and pagination (raw data)
- [ ] list : list(<dynamic_layout>)
- [ ] raw  ( readonly monaco editor)

# Layout Format
## default
| keyword | Definition                       | Data Type |
|---------|----------------------------------|-----------|
| name    | layout name use in tab and title | str       |
| type    | layout type                      | str       |
| options |                                  | dict      |



# item
## data type
| props | support? |
|-------|----------|
| data  |  O       |
| api   |  O(get)  |
|toolset|  X       |


## options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |
| fields    | dynamic form fields | DynamicField[] |


# simple-table
## data type
| props | support? |
|-------|----------|
| data  |  O       |
| api   |  X       |
|toolset|  X       |

## options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |
| fields    | dynamic form fields | DynamicField[] |


# table

## data type
| props | support? |
|-------|----------|
| data  |  X       |
| api   |  O       |
|toolset|  O       |

## options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |
| fields    | dynamic form fields | DynamicField[] |

# query-search-table
## data type
| props | support? |
|-------|----------|
| data  |  X       |
| api   |  O       |
|toolset|  O       |

## options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| root_path | default root path   | str            |


# list
## data type
| props | support? |
|-------|----------|
| data  |  bypass  |
| api   |  bypass  |
|toolset|  X       |
## options
| keyword   | Definition          | Data Type      |
|-----------|---------------------|----------------|
| layouts   | dynamic layouts     | DynamicLayout[]|
