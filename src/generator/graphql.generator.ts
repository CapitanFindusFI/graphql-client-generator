import {IGraphQLParam, IGraphQLQueryRequest, IGraphQLRequest} from "../interfaces/graphql-request.interface";
import {generateParameterAlias} from "../../tests/utils";
import {GraphQLField, GraphQLRequestType} from "../types";
import {set} from 'lodash';
import {ValidationError} from "../exceptions/validation.error";

abstract class GraphqlGenerator {
    protected requestTypeName: GraphQLRequestType;

    protected constructor(requestTypeName: GraphQLRequestType) {
        this.requestTypeName = requestTypeName;
    }

    private static validateRequests(requests: IGraphQLRequest[]): void {
        requests.forEach(GraphqlGenerator.validateRequest);
    }

    private static validateRequest(request: IGraphQLRequest): void {
        const {fragmentParams, fragmentValues, fragmentName} = request;
        if (Array.isArray(fragmentParams)) {
            if (!fragmentValues) {
                throw new ValidationError(`request with name: ${fragmentName} has parameters but no values`);
            }
            const valueNames: string[] = Object.keys(fragmentValues);
            const requestParamNames: string[] = fragmentParams.map(GraphqlGenerator.generateParameterAlias);

            const missingValueNames: string[] = requestParamNames.filter((paramName: string) => {
                if (valueNames.indexOf(paramName) === -1) return false;
                if (!fragmentValues[paramName]) return false;
            });
            if (missingValueNames.length) {
                throw new Error(`The following values are missing from the request:\n${missingValueNames.join('\n-')}`)
            }
        }
    }

    private static collectRequestsParameters(requests: IGraphQLRequest[]) {
        return requests.reduce((params: IGraphQLParam[], request: IGraphQLQueryRequest) => {
            return params.concat(request.fragmentParams || []);
        }, []);
    }

    private static generateParameterAlias(param: IGraphQLParam) {
        const {name, alias} = param;
        if (!name) throw new ValidationError('Missing required param name');

        return alias ? alias : `$${name}`;
    }

    private generateRequestHeader(requests: IGraphQLRequest[]): string {
        const params = GraphqlGenerator.collectRequestsParameters(requests);
        let requestHeader = this.requestTypeName;
        if (params.length) requestHeader += `(${GraphqlGenerator.collectHeaderParams(params)})`;
        return requestHeader;
    }

    private static collectHeaderParams(params: IGraphQLParam[]): string {
        return params.map(GraphqlGenerator.collectHeaderParam).join(',');
    }

    private static collectHeaderParam(param: IGraphQLParam): string {
        if (!param.type) throw new ValidationError('Missing required param type');
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
            } else {
                throw new TypeError(`Unknown field type for: ${key}`)
            }
            return params;
        }, []);
    }

    public generateRequestString(requests: IGraphQLRequest[]): string {
        GraphqlGenerator.validateRequests(requests);
        const queryHeader = this.generateRequestHeader(requests);
        const queryFragments = this.generateRequestFragments(requests);

        return `${queryHeader}{\n${queryFragments}}`;
    }
}

export default GraphqlGenerator;
