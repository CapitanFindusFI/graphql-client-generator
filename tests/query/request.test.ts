import {generateQueryRequest} from "../utils";
import {GraphQLRequest} from "../../src/interfaces/graphql-request.interface";

describe('query request generator test suite', () => {
    it('should generate a full query with a single request', () => {
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                name: 'id',
                type: 'String',
                alias: '$id'
            }],
            fragmentFields: [
                'id', 'name', 'surname'
            ]
        }];
        const queryString: string = generateQueryRequest(requests);
        expect(queryString).toBe('query($id:String){\nusers(id:$id){id name surname}}');
    });

    it('should generate a full query with multiple requests', () => {
        const requests: GraphQLRequest[] = [{
            fragmentName: 'users',
            fragmentParams: [{
                name: 'id',
                type: 'String',
                alias: '$id'
            }],
            fragmentFields: [
                'id', 'name', 'surname'
            ]
        }, {
            fragmentName: 'accounts',
            fragmentFields: [
                'id', 'name', 'surname'
            ]
        }];
        const query: string = generateQueryRequest(requests);
        expect(query).toBe('query($id:String){\nusers(id:$id){id name surname}\naccounts{id name surname}}');
    });
});
