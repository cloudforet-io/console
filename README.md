# spaceone-design-system


## How to Use


### 1. Install

```shell
npm i -S @spaceone/design-system
```

### 2. Set plugin
   
Add following lines to ```main.js``` file. <br/>

```javascript
import SpaceDesignSystem from '@spaceone/design-system';

Vue.use(SpaceDesignSystem);
```

### 3. Set components locally

Example: 

```javascript
import { PButtonTab, PDynamicLayout } from '@spaceone/design-system';

export default {
    components: {
        PButtonTab,
        PDynamicLayout,
    },
    ...
}
```

<br/>

## How to Apply Styles

SpaceONE Design System is based on Tailwindcss.<br/>

### Global Styles

#### Case 1. All styles
If your project doesn't use tailwindcss, add the code below to ```main.ts```.

```javascript
import '@spaceone/design-system/dist/css/style.css';
```

### Case 2. Without tailwindcss styles
If your project use tailwindcss, you don't need to import all styles. <br/>
In that case, add codes below to your ```tailwind.config.js```.

```javascript
const spaceoneTailwind = require('@spaceone/design-system/tailwind.config.js')

module.exports = {
    theme: {
        ...spaceoneTailwind.theme,
        // your customized theme
    },
    variants: [...spaceoneTailwind.variants, 
    //your customized variants 
    ],
    plugins: [
        ...spaceoneTailwind.plugins,
        //your customized plugins 
    ]
}
```

Also, you need to add codes below to your ```main.js```.

```javascript
import '@spaceone/design-system/dist/css/light-style.css';
```


