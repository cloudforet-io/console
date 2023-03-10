
<h1 align="center">Cloudforet Console</h1>  
  
<br/>  
<div align="center" style="display:flex;">  
  <img width="300" src="https://user-images.githubusercontent.com/65589909/197983716-71a1bd21-4d6a-4217-b509-177afbadf5bc.png">  
  <p> <br>
<img  alt="Version"  src="https://img.shields.io/badge/version-0.9-blue.svg?cacheSeconds=2592000"  />  
<a  href="https://cloudforet.io/"  target="_blank">  
<img  alt="Documentation"  src="https://img.shields.io/badge/documentation-yes-brightgreen.svg"  />  
</a>  
<a  href="https://www.apache.org/licenses/LICENSE-2.0"  target="_blank">  
<img  alt="License: Apache 2.0"  src="https://img.shields.io/badge/License-Apache 2.0-yellow.svg"  />  
</a> <br>
<a href="http://storybook.developer.spaceone.dev/"  target="_blank">  
    <img alt="spaceone storybook" src="https://img.shields.io/badge/Design System-SpaceOne-blueviolet.svg?logo=storybook" />  
</a>  
    <img alt="spaceone storybook" src="https://github.com/spaceone-dev/console/workflows/StoryBook%20CD/badge.svg?branch=master" />  
</p>  
  
</div>    
  

&nbsp;
  
> Front-end Project for Cloudforet. Components made with Vue2 Composition API.  


[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/0)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/0)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/1)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/1)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/2)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/2)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/3)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/3)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/4)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/4)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/5)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/5)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/6)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/6)[![](https://sourcerer.io/fame/wesky93/spaceone-dev/console/images/7)](https://sourcerer.io/fame/wesky93/spaceone-dev/console/links/7)

## How to Use

### Run dev server

```shell
npm install

npm run build:packages

npm run serve
```

### Chart License

The console internally uses amCharts for all charts. <br/>
Before using the console, look carefully at amCharts' license. <br/>
If you want to purchase the amCharts license that suits you and use it on your console, 
follow the instructions below.


#### Add your license key to ```public/config/default.json```

```json
{
 "AMCHARTS_LICENSE": {
  "CHARTS": "",
  "MAPS": "",
  "TIMELINE": ""
 }
}
```


## E2E Test Settings

### Set Variables

#### Add `playwright/local.env` file into project root.
```
  USERNAME=testuser
  PASSWORD=password
  BASEURL=https://example.com/ 
```
- `BASEURL` is an optional variable. Default is `http://localhost:8080`


## 🧩 Mirinae - Cloudforet Design System  
[Mirinae storybook](http://storybook.developer.spaceone.dev/)  
  
 &nbsp;  
 &nbsp;   
## 👨‍👩‍👧 Author  
  
See our [OWNERS](https://github.com/cloudforet-io/console/blob/master/AUTHORS) file.   
  
&nbsp;  
&nbsp;  
  
## 📝 License  
  
    
This project is [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) licensed.

