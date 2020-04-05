import {GraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import {generateQueryRequest} from "../utils";

describe('query generator error test suite', () => {
    it('should throw an error for missing parameter name', () => {
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                alias: '$id',
                type: 'String',
                name: ''
            }],
            fragmentFields: ['name', 'surname']
        }];

        expect(() => generateQueryRequest(requests)).toThrow(Error);
    });

    it('should throw an error for missing type', () => {
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                alias: '$id',
                type: '',
                name: 'id'
            }],
            fragmentFields: ['name', 'surname']
        }];

        expect(() => generateQueryRequest(requests)).toThrow(Error);
    });
});
