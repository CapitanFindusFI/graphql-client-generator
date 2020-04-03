import {IGraphQLParam} from "../../src/interfaces/graphql-request.interface";
import {generateQueryHeader} from "../utils";

describe('query header generator test suite', () => {

    it('should correctly generate query header with a single aliased param', () => {
        const params: IGraphQLParam[] = [{
            alias: '$id',
            type: 'String',
            name: 'id'
        }];
        const header: string = generateQueryHeader(params);
        expect(header).toBe('query($id:String)');
    });

    it('should correctly generate query header with a single non-aliased param', () => {
        const params: IGraphQLParam[] = [{
            type: 'String',
            name: 'id'
        }];
        const header: string = generateQueryHeader(params);
        expect(header).toBe('query($id:String)');
    });

    it('should correctly generate the same header with params aliased or not', () => {
        const params1: IGraphQLParam[] = [{
            type: 'String',
            name: 'id'
        }];
        const header1: string = generateQueryHeader(params1);
        const params2: IGraphQLParam[] = [{
            alias: '$id',
            type: 'String',
            name: 'id'
        }];
        const header2: string = generateQueryHeader(params2);
        expect(header1).toBe(header2);
    });
});
