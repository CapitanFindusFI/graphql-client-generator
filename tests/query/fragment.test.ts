import {GraphQLParam, GraphQLQueryRequest} from "../../src/interfaces/graphql-request.interface";
import {generateFragmentHeader, generateQueryFragments} from "../utils";

describe('query fragments generator test suite', () => {
    it('should correctly generate a fragment header without params', () => {
        const header = generateFragmentHeader('users');
        expect(header).toBe('users');
    });

    it('should correctly generate a fragment header with a single param', () => {
        const params: GraphQLParam[] = [{
            name: 'id',
            type: 'String'
        }];
        const header = generateFragmentHeader('users', params);
        expect(header).toBe('users(id:$id)');
    });

    it('should correctly generate multiple fragment headers', () => {
        const requests: GraphQLQueryRequest[] = [{
            fragmentName: 'users',
            fragmentFields: []
        }, {
            fragmentName: 'accounts',
            fragmentFields: []
        }];
        const fragment = generateQueryFragments(requests);
        expect(fragment).toBe('users{}\naccounts{}');
    })
});
