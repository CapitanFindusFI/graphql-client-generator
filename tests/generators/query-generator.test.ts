import {GraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import GraphqlQueryGenerator from "../../src/generator/graphql-query.generator";
import {ValidationError} from "../../src/exceptions/validation.error";

const generator = new GraphqlQueryGenerator();

describe('query generator class test suite', () => {
    it('should correctly create a graph query with a simple request without params', () => {
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('query{\nusers{id name surname}}');
    });

    it('should correctly generate a graph query with multiple fragments', () => {
        const requests: GraphQLRequest[] = [{
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
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                alias: '$id',
                type: 'String',
                name: 'id'
            }],
            fragmentFields: ['name', 'surname'],
            fragmentValues: {}
        }];

        expect(() => generator.generateRequestString(requests)).toThrow(ValidationError);
    });

    it('should throw an error for missing values', () => {
        const requests: GraphQLRequest[] = [{
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
