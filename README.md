## CleverTap Firefox OS SDK

### Installation

- Copy clevertap.js/clevertap.min.js directly into your FireFox app js directory and load in a script tag in your index.html:  

  `<script type="text/javascript" src="js/libs/clevertap.js" defer></script>`

  See [Example](Examples/Simple).

- Install via npm `npm install --save clevertap-fxos` and require/import the module:  

  `var clevertap = require('clevertap-fxos');`  

  See [Example](Examples/StartStopAngular).

### Usage

#### Initialization
```
clevertap.setLogLevel(clevertap.logLevels.DEBUG); // optional
clevertap.init("WWW-WWW-WWRZ");
```
#### Record An EVENT
`clevertap.event.push("Product Viewed");`

#### Update A User Profile
```
clevertap.profile.push({
 "Site": {
   "Name": "Jack Montana",
   "Age": 28
 }
});
```
