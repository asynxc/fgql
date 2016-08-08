# fgql # fetch-graphQl

fgql is a very small (25k unminified, 11k minified) fetch library that offer simplicity and reach features for interacting with graphQl endpoint.
Although Relay offer more features and also a complex API that you don't want it in a small or maybe medium projects.

fgql is umd (Universal Module Definition) library.

## Why ?

from experience point of view, i had to create this library to use it in a ready-production react medium sized project. all i needed is a simple and most important easy to integrate API that under the hood take care of heavy part dealing with two graphQl server.
of course i could use Relay instead, but then i have to rewrite the application. which is not an option at the time.

## Installation

`npm install --save fgql`

## Dependencies

fgql use `fetch` under the hood so you need to install the polyfill that suites your target environment.

You can use :
* for Web : [whatwg-fetch](https://github.com/github/fetch)
* for node : [node-fetch](https://github.com/bitinn/node-fetch)
* for both : [fetch-everywhere](https://github.com/lucasfeliciano/fetch-everywhere)

you have to import it at the top of your entrypoint project.

```js
import 'whatwg-fetch'; // <-- at the very top
import { QueryObject } from 'fgql';

var GroupQuery = new QueryObject({
  query: (vars) => `query { Viewer { Groups(first: ${vars.first}) { name } } }`
})

GroupQuery.fetch({first: 10})
```

## API :

fgql expose three classes. `DefaultNetwokLayer` , `EndPoint` and `QueryObject`. That are built on top of each other.

### `DefaultNetwokLayer`

Network layer is what's called to perform query and handle network operations such timeout, retries...
fgql comes with a default network layer that is able to :
	*  timeout after performing a HTTP request without response within predefined timeout in ms..
	*  attempt a N retry delayed by predefined wait time in ms.

Parameters Table :

| Parameter     | Type 											| Default value  		|
| :----------- 	| :------------------- 							| :------------------- 	|
| uri 			| string 										|  undefined			|
| timeout    	| number \| array \| function(attempt: number)	|  3000					|
| retries     	| array \| function(attempt: number)    		|  [1000, 2000]			|

```js
import {DefaultNetwokLayer} from 'fgql'

const uri = 'http://swapi.graphene-python.org/graphiql'

var NetLayer = new DefaultNetwokLayer(uri, {
	// timeout: 3000, // default
	// retries: [1000, 2000] // default (3 attemps in total)
	timeout: (attempt) => attempt * 2000
	retries: (attempt) => [1000, 2000][attempt - 1]
})

const query = 'query { Viewer { Groups { label } } }'

NetLayer.performQuery(query).then((data) => console.log(data)).catch((err) => console.error(err))
```

`retries` can be either an array or a function.
Either ways it define number of retries and delay time between each attempt in ms.
If `retries` type is array, its length define the number of retries.
If `retries` type is function, retries will stop when it return undefined.

`DefaultNetwokLayer` is used when none is provided.
But of course you can create your own Network layer.

### `EndPoint`

EndPoint is the object that encapsulate all informations related to graphql endpoint.

Parameters Table :

| Parameter     | Type 					| Default value  		|
| :----------- 	| :-------------------	| :------------------- 	|
| uri 			| string 				|  '/graphql'			|
| net			| object				|  DefaultNetwokLayer	|
| options		| plain object    		|  {}					|
| context		| plain object    		|  {}					|


```js
import {DefaultNetwokLayer, EndPoint} from 'fgql'

var endPoint= new EndPoint({
	uri: '/graphql', // default
	net: DefaultNetwokLayer, // default
	options: { 
		timeout: (attempt) => attempt * 2000,
		retries: [500, 2000, 3000] // 4 fetch attemps
	},
	context: {
		userId: 56,
		getToken: () => storage.get('token')
	}
})

// ...
```

`options` are passed to given Network Layer for instantiation.
`context` is immutable object passed down to first declared pre and post middlwares.

Properties Table :

| Property     		| Type 																									|
| :----------- 		| :---------------------------------------------------------------------------------------------------	|
| fetch				| function(query: string): Promise																		|
| pre				| function(mdl: function(header: plainObject, context: plainObject)): EndPoint							|
| post				| function(mdl: function(responce: any, err: any, refetch; function(), context: plainObject)): EndPoint	|

`EndPoint` provide a pre and post middleware functionality which allow to subscribe to **before** and **after** hooks of fetch operations.

```js
import {EndPoint} from 'fgql'

// ...

endPoint.pre((header, context) => next => {
	header = {
		token: context.getToken()
	}
	next(header, context)
}).post((response, err, refetch, context) => next => {
	if (err && err.message == /session expired/) {
		context.refreshToken().then(() => refetch())
	}
	next(response, err)
})

endPoint.fetch(query).then((data) => console.log(data)).catch((err) => console.error(err))
```

Sometimes you have to reach different endpoints from you application. I would suggest to do it in the backend where graphql is great of gathering different service into one.
but what if i'm not allowed to create a new server or touch any existent one.
fgql allow you to declare many EndPoints and use them when and where you want.

### `QueryObject`

All of `DefaultNetworkLayer` and `EndPoint` can be used individually. but they're intended to be used with `QueryObject` module.
a `QueryObject` is the part that handle query construction, variables, auto fetching and data processsing.

Parameters Table :

| Parameter     	| Type 																					| Default value  					|
| :----------- 		| :-------------------																	|  :------------------- 			|
| query				| string \| function(vars: plainObject): string											|  undefined						|
| defaultVars		| object (mutable) \| function(ownerProps: plainObject): plainObject					|  {}								|
| processVars		| function(inVars \| ownerProps: plainObject, defaultVars: plainObject): plainObject	|  () => {}							|
| processResult		| function(result: any): plainObject													|  (result) => 	result				|
| endPoint			| instanceof EndPoint																	|  new EndPoint() \| ownerEndPoint	|
| fetchInterval		| number \| function(ownerProps): number    											|  (result) => 	result				|


```js
import {EndPoint, QueryObject} from 'fgql'

var UserQO = QueryObject({
	query: (vars) => `query { 
						Viewer {
							Users(offset: ${vars.offset}, first: ${vars.first}) {
								name
								surname
							}
						}
					}`,
	defaultVars: (ownerProps) => ({ // ownerProps are passed when used with react-fgql
		first: 10,
		offset: 0
	}),
	processVars: (inVars, defaultVars) => ({
		first: inVars.first,
		offset: inVars.offset
	})
	fetchInterval: 0 // default
	endPoint: endPoint
})

// ..
```

if `query` type is a string, processsing variables is ignored.
otherwise the result of `defaultVars`, `inVars` and `processVars` are respectively merged into a final variable object. then passed to `query` function for resolving.

`defaultVars` can be either a plainObject or function that return a plainObject.
if *react-fgql* is used and `defaultVars` is a function. it gets invoked with ownerProps as argument.

`processVars` is a function get executed lastely of variables construction chain. which allow to override or generate new variables.

`processResult` is a function that gets invoked with post middlewares result data as argument.
which is a query object specific.

`fetchInterval` define delay time between each fetch operation.
if *react-fgql* is used, the auto fetch mode starts immidiatlly every X ms when component is mounted.

> fetch operations are sequentially fired.
> No fetch operation is fired if the first is running.

Properties Table :

| Property     		| Type 																														|
| :----------- 		| :-------------------																										|
| fetch				| function(vars: plainObject): Promise																						|
| isFetching		| function(): boolean																										|
| autoFetch			| function(vars: plainObject, fetchinterval: number): function(respCb: function(responce:any), errCb: function(err: any))	|
| stopAutoFetch		| function()    																											|
| Data				| function(): any																											|
| Error				| function(): any																											|
| ClearError		| function()																												|
| resolveQuery		| function(query: string): string																							|


```js
// ...

const inVars = {
		first: 100,
		offset: 10
}

// used internaly by QueryObject to resolve query
UserQO.resolveQuery(inVars)
// query { 
//		Viewer {
//			Users(offset: 10, first: 100) {
//				name
//				surname
//			}
//		}
//	}

// fire a fetch
UserQO.fetch(inVars).then((data) => console.log(data)).catch((err) => console.error(err))

// fetch every 5s
UserQO.autoFetch(inVars, 5000)((response) => console.log(response), (err) => console.error(err))

// check if fetching
UserQO.isFetching()

// return errors if any present (error are initialized in each fetch attempt)
UserQO.Error()

// return unprocessed data if any present
UserQO.Data()

// clear errors
UserQO.ClearError()

// stop auto fetching after 10s
setTimeout(() => UserQO.stopAutoFetch(), 10000)

// stop auto fetch by explicitly returing `false`
UserQO.autoFetch(inVars, 5000)(
	(response) => {
		// code
		if (/* some condition */) return false
	},
	(err) => {
		// code
		if (/* some other condition */) return false
	}
)

```

To stop auto fetching, you can either call `stopAutoFetch` method or return explicitly `false` from one of callback functions of `autoFetch` method


## Features plan 


## Test

`npm run test`

## Contributing

```
git clone https://github.com/hamavb/fgql.git
cd fgql
npm install
```

Criticize or pull requests are very welcome.
