import {IGraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import {ValidationError} from "../../src/exceptions/validation.error";
import GraphqlMutationGenerator from "../../src/generator/graphql-mutation.generator";

const generator = new GraphqlMutationGenerator();

describe('mutation generator class test suite', () => {
    it('should correctly create a graph mutation with a simple request without params', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('mutation{\nusers{id name surname}}');
    });

    it('should correctly generate a graph mutation with multiple fragments', () => {
        const requests: IGraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentFields: ['id', 'name', 'surname']
        }, {
            fragmentName: 'accounts',
            fragmentFields: ['id', 'createdAt']
        }];
        const query: string = generator.generateRequestString(requests);
        expect(query).toBe('mutation{\nusers{id name surname}\naccounts{id createdAt}}');
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
            fragmentValues: {}
        }];

        expect(() => generator.generateRequestString(requests)).toThrow(ValidationError);
    });

    it('should throw an error for missing values', () => {
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
