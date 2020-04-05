import {IGraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import GraphqlQueryGenerator from "../../src/generator/graphql-query.generator";

const generator = new GraphqlQueryGenerator();

describe('query generator class test suite', () => {
    it('should correctly create a graph query with a simple request', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('query{\nusers{id name surname}}');
    });
});
