import {IGraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import GraphqlQueryGenerator from "../../src/generator/graphql-query.generator";

const generator = new GraphqlQueryGenerator();

describe('query generator class test suite', () => {
    it('should correctly create a graph query with a simple request without params', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('query{\nusers{id name surname}}');
    });

    it('should correctly generate a graph query with multiple fragments', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }, {
            fragmentName: 'accounts',
            fragmentFields: ['id', 'createdAt']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('query{\nusers{id name surname}\naccounts{id createdAt}}');
    });

    it('should throw an error for incorrect values', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                alias: '$id',
                type: 'String',
                name: 'id'
            }],
            fragmentFields: ['name', 'surname'],
            fragmentValues: {
                id: '123'
            }
        }];

        expect(() => generator.generateRequestString(requests)).toThrow(Error);
    });
});
