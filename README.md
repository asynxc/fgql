# fgql # fetch-graphQl

fgql is a fetch library that offers simplicity and reach functionnality for interacting with backend graphQl server. Although Relay offer more features, but comes with a complex API that you don't wan it in a small/medium projects.

## Why ?

from experience point of view, i had to create this library to use it for a in-production react medium project. all i needed is a simple API that under the hood take care of heavy part dealing with graphQl server and easy to integrate.
of course i could use Relay instead, but then i have to rewrite the application.

## Installation

`npm install --save fgql`

## Dependencies

fgql uses `fetch` under the hood so you need to install the polyfill that suites your target environment.

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

GroupsQuery.fetch({first: 10})
```

## API :

fgql expose three classes. `DefaultNetwokLayer` , `EndPoint` and `QueryObject`

### `DefaultNetwokLayer`

Network layer is what's called to perform query and handle network operations such timeout, retries...
fgql comes with a default network layer that is able to :
	-  timeout after performing a HTTP request without responce for predefined timeout value in ms.
	-  attempt a retry delayed by predefined wait time in ms.

```js
import {DefaultNetwokLayer} from 'fgql'

const uri = 'http://swapi.graphene-python.org/graphiql'

var NetLayer = new DefaultNetwokLayer(uri, {
	timeout: 3000, // default
	retries: [1000, 2000] // default (3 attemps in total)
})

const query = 'query { Viewer { Groups { label } } }'

NetLayer.performQuery(query).then((data) => console.log(data)).catch((err) => console.error(err))
```

| Item     | Value | Qty   |
| :------- | ----: | :---: |
| Computer | $1600 |  5    |
| Phone    | $12   |  12   |
| Pipe     | $1    |  234  |

### `EndPoint`

EndPoint is the object that encapsulate all information related to end point graphql  server.

```js
import {DefaultNetwokLayer, EndPoint} from 'fgql'

var NetLayer = new EndPoint({
	uri: '',
	net: DefaultNetwokLayer,
	options: {
		timeout: (attempt) =>
	}
	retries: [1000, 2000] // default (3 attemps in total)
})

const query = 'query { Viewer { Groups { label } } }'

NetLayer.performQuery(query).then((data) => console.log(data)).catch((err) => console.error(err))
```

sometimes you have to reach different end points from you application. i would suggest to do it in the backend where graphql is great of gathering different service into one.
but what if i'm not allowed to create a new server or touch any existent one.
fgql allow you to declare many end point and use them when and where you want.

but of course you can create or use other network layer.

## Features plan 
...to be continued

## Test
...to be continued
