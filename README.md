# fgql # fetch-graphQl

fgql is a fetch library that offers simplicity and reach functionnality for interacting with backend graphQl server. Although Relay offer more features, but comes with a complex API that you don't wanna it in a small/medium projects.

## Why ?

## Installation

`npm install --save fgql`

## Dependencies

fgql uses `fetch` under the hood so you need to install the polyfill that suites your target envirement.

You can use :
* for Web : [whatwg-fetch](https://github.com/github/fetch)
* for node : [node-fetch](https://github.com/bitinn/node-fetch)
* for both : [fetch-everywhere](https://github.com/lucasfeliciano/fetch-everywhere)

you have to import it at the top of your entrypoint project.

```js
import 'whatwg-fetch'; // <-- at the very top 
import { QueryObject } from 'fgql';

var GroupsQuery = new QueryObject({
  query: (vars) => `query { Viewer { Groups(first: ${vars.first}) { name } } }`
})
```

## API :

fgql expose three classes. `DefaultNetwokLayer` , `EndPoint` and `QueryObject`

### `DefaultNetwokLayer`

Network layer is what's called to perform query and handle network operations such timeout, retries...

```js
import {DefaultNetwokLayer} from 'fgql'

var NetLayer = new DefaultNetwokLayer('', {
	timeout: 3000, // default
	retries: [1000, 2000] // default (3 attemps in total)
})
const query = 'query { Viewer{ Groups { label } } }'
NetLayer.performQuery(query).then(() => console.log(data)).catch((err) => console.error(err))
```

...to be continued


## Features plan 
...to be continued

## Test
...to be continued
