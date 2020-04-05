import {IGraphQLParam, IGraphQLQueryRequest, IGraphQLRequest} from "../interfaces/graphql-request.interface";
import {generateParameterAlias} from "../../tests/utils";
import {GraphQLField} from "../types";
import {set} from 'lodash';

abstract class GraphqlGenerator {
    protected requestTypeName: string;

    protected constructor(requestHeader: string) {
        this.requestTypeName = requestHeader;
    }

    private collectRequestParamters(requests: IGraphQLRequest[]) {
        return requests.reduce((params: IGraphQLParam[], request: IGraphQLQueryRequest) => {
            const {fragmentParams} = request;
            if (Array.isArray(fragmentParams)) {
                return params.concat(...fragmentParams);
            } else {
                return params;
            }
        }, []);
    }

    private static generateParameterAlias(param: IGraphQLParam) {
        const {name, alias} = param;
        if (!name) throw new Error('Missing required param name');

        return alias ? alias : `$${name}`;
    }

    private generateRequestHeader(params: IGraphQLParam[]): string {
        let requestHeader = this.requestTypeName;
        if (params.length) requestHeader += `(${GraphqlGenerator.collectHeaderParams(params)})`;
        return requestHeader;
    }

    private static collectHeaderParams(params: IGraphQLParam[]): string {
        return params.map(GraphqlGenerator.collectHeaderParam).join(',');
    }

    private static collectHeaderParam(param: IGraphQLParam): string {
        if (!param.type) throw new Error('Missing required param');
        const useAlias = GraphqlGenerator.generateParameterAlias(param);
        return [useAlias, param.type].join(':');
    }

    private generateRequestFragments(requests: IGraphQLRequest[]) {
        return requests.map(this.generateRequestFragment.bind(this)).join('\n');
    }

    private generateRequestFragment(request: IGraphQLRequest): string {
        const {fragmentName, fragmentParams, fragmentFields} = request;
        const fragmentHeader = GraphqlGenerator.generateFragmentHeader(fragmentName, fragmentParams);
        const fragmentBody = this.generateFragmentBody(fragmentFields);

        return `${fragmentHeader}{${fragmentBody}}`;
    }

    private static generateFragmentHeader(name: string, params: IGraphQLParam[] = []): string {
        let fragmentHeader: string = name;
        if (params.length) fragmentHeader += `(${GraphqlGenerator.generateFragmentHeaderParams(params)})`;
        return fragmentHeader;
    }

    private static generateFragmentHeaderParams(params: IGraphQLParam[]): string {
        return params.map(GraphqlGenerator.generateFragmentHeaderParam).join(',');
    }

    private static generateFragmentHeaderParam(param: IGraphQLParam): string {
        const useAlias = generateParameterAlias(param);
        return [param.name, useAlias].join(':');
    }

    private generateFragmentBody(fields: string[]): string {
        const fieldsObject: GraphQLField = this.collectFieldsAsObject(fields);
        const fragmentBodyComponents: string[] = this.generateFragmentFieldsString(fieldsObject);
        return fragmentBodyComponents.join(' ');
    }

    private collectFieldsAsObject(fields: string[]): GraphQLField {
        return fields.reduce((object: object, field: string) => {
            set(object, field, field);
            return object;
        }, {});
    }

    private generateFragmentFieldsString(fieldsObject: GraphQLField): string[] {
        return Object.keys(fieldsObject).reduce((params: string[], key: string) => {
            const value: any = fieldsObject[key];
            if (typeof (value) === 'object') {
                params.push(key, '{', ...this.generateFragmentFieldsString(value), '}');
            } else if (typeof (value) === 'string') {
                params.push(key);
            }
            return params;
        }, []);
    }

    public generateRequestString(requests: IGraphQLRequest[]): string {
        const requestParams = this.collectRequestParamters(requests);
        const queryHeader = this.generateRequestHeader(requestParams);
        const queryFragments = this.generateRequestFragments(requests);

        return `${queryHeader}{\n${queryFragments}}`;
    }
}

export default GraphqlGenerator;
