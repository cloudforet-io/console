## support Properties Type

| Json Schema - Type | Target Component | Support |
|--------------------|------------------|---------|
| string             | PInputText       |    O    |
| boolean            | PRadio           |    O    |
| enum               | PSelectDropdown  |    O    |
| array              | PTagsInput       |    O    |
| number             | PInputText       |    O    |
| integer            | PInputText       |    O    |


### array
#### items.type
> auto change array items type

- number
- integer


## support Other Schema
| Json Schema      | feature to      | Support |
|------------------|-----------------|---------|
| title            | label           |    O    |
| example          | placeholder     |    O    |
| default          | default value   |    O    |


## support Validation(by toolset) 

| Validation               | Support |
|--------------------------|---------|
| required                 |    X    |
| enum                     |    X    |
| range                    |    X    |
| multipleOf               |    X    |
| subschemas conditionally |    X    |
