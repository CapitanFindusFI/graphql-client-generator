# GraphQL Request generator
[![codecov](https://codecov.io/gh/CapitanFindusFI/graphql-client-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/CapitanFindusFI/graphql-client-generator)

Utility class to generate GraphQL queries or mutations to be tested or used with an API client

### The GraphQLRequest interface
Classes are using an array of `GraphQLRequest` objects, structured as following
```typescript
type GraphQLValueItem = string | number | boolean | object;
type GraphQLValue = { [k: string]: GraphQLValueItem };

interface GraphQLRequest {
    fragmentName: string;
    fragmentParams?: GraphQLParam[];
    fragmentFields?: string[];
    fragmentValues?: GraphQLValue;
}

interface GraphQLParam {
    name: string;
    alias?: string;
    type: string;
}
```

### GraphQLGenerator

The `GraphQLGenerator` class will do all of the syntax checking and values-compliance based on passed params. For example
```typescript
const request: IGraphQLRequest = {
    fragmentName: 'createUser',
    fragmentFields: ['id','name','surname'],
    fragmentParams:[{
        name:'user',
        type:'UserInput'
    }]
}
```

Not providing `$user` inside `fragmentValues` object will throw a ValidationError

#### Generation

Consider the following input

```typescript
const requests: IGraphQLRequest[] = [{
    fragmentName: 'users',
    fragmentFields: ['id', 'name', 'surname'],
    fragmentParams: [{
        name: 'id',
        type: 'String'
    }],
    fragmentValues: {
        $id: "123"
    }
}];
```

##### Query Generator
With a `GraphqlQueryGenerator` class, will produce the following output
```typescript
const generator = new GraphqlQueryGenerator()
const query = generator.generateRequestString(requests);

// query
query($id:String) { 
    users(id:$id){
        id
        name
        surname
    }
}
```

##### Mutation Generator

With a `GraphqlMutationGenerator` class, will produce the following output
```typescript
const generator = new GraphqlMutationGenerator()
const query = generator.generateRequestString(requests);

// mutation
mutation($id:String) { 
    users(id:$id){
        id
        name
        surname
    }
}
```

#### Linting
ESLint has been implemented in this repo, you can run it by using
```
npm run lint
```

#### Tests
Tests have been written using `Jest` and `ts-jest`, you can run them by using
```
npm run test
```
