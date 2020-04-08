import {GraphQLParam, GraphQLQueryRequest, GraphQLRequest} from "../interfaces/graphql-request.interface";
import {generateParameterAlias} from "../../tests/utils";
import {GraphQLField, GraphQLRequestType} from "../types";
import {set} from 'lodash';
import {ValidationError} from "../exceptions/validation.error";

abstract class GraphqlGenerator {
    protected requestTypeName: GraphQLRequestType;

    protected constructor(requestTypeName: GraphQLRequestType) {
        this.requestTypeName = requestTypeName;
    }

    private static validateRequests(requests: GraphQLRequest[]): void {
        requests.forEach(GraphqlGenerator.validateRequest);
    }

    private static validateRequest(request: GraphQLRequest): void {
        const {fragmentParams, fragmentValues, fragmentName} = request;
        if (Array.isArray(fragmentParams) && typeof (fragmentValues) === 'object') {
            const valueNames: string[] = Object.keys(fragmentValues);
            if (!valueNames.length) {
                throw new ValidationError(`request with name: ${fragmentName} has parameters but no values`);
            }

            const requestParamNames: string[] = fragmentParams.map((param: GraphQLParam) => param.name);

            const missingValueNames: string[] = requestParamNames.filter((paramName: string) => {
                if (valueNames.indexOf(paramName) === -1) return true;
                if (!fragmentValues[paramName]) return true;
            });
            if (missingValueNames.length) {
                throw new Error(`The following values are missing from the request:\n${missingValueNames.join('\n-')}`)
            }
        }
    }

    private static collectRequestsParameters(requests: GraphQLRequest[]): GraphQLParam[] {
        return requests.reduce((params: GraphQLParam[], request: GraphQLQueryRequest) => {
            return params.concat(request.fragmentParams || []);
        }, []);
    }

    private static generateParameterAlias(param: GraphQLParam): string {
        const {name, alias} = param;
        if (!name) throw new ValidationError('Missing required param name');

        return alias ? alias : `$${name}`;
    }

    private generateRequestHeader(requests: GraphQLRequest[]): string {
        const params = GraphqlGenerator.collectRequestsParameters(requests);
        let requestHeader = this.requestTypeName;
        if (params.length) requestHeader += `(${GraphqlGenerator.collectHeaderParams(params)})`;
        return requestHeader;
    }

    private static collectHeaderParams(params: GraphQLParam[]): string {
        return params.map(GraphqlGenerator.collectHeaderParam).join(',');
    }

    private static collectHeaderParam(param: GraphQLParam): string {
        if (!param.type) throw new ValidationError('Missing required param type');
        const useAlias = GraphqlGenerator.generateParameterAlias(param);
        return [useAlias, param.type].join(':');
    }

    private generateRequestFragments(requests: GraphQLRequest[]): string {
        return requests.map(this.generateRequestFragment.bind(this)).join('\n');
    }

    private generateRequestFragment(request: GraphQLRequest): string {
        let fragmentString = '';
        const {fragmentName, fragmentParams, fragmentFields} = request;
        const fragmentHeader = GraphqlGenerator.generateFragmentHeader(fragmentName, fragmentParams);
        fragmentString += fragmentHeader;
        if (fragmentFields) {
            if (!Array.isArray(fragmentFields)) {
                throw new Error('Fields must be an array')
            }
            if (fragmentFields.length) {
                const fragmentBody = this.generateFragmentBody(fragmentFields);
                fragmentString += `{${fragmentBody}}`;
            }
        }

        return fragmentString
    }

    private static generateFragmentHeader(name: string, params: GraphQLParam[] = []): string {
        let fragmentHeader: string = name;
        if (params.length) fragmentHeader += `(${GraphqlGenerator.generateFragmentHeaderParams(params)})`;
        return fragmentHeader;
    }

    private static generateFragmentHeaderParams(params: GraphQLParam[]): string {
        return params.map(GraphqlGenerator.generateFragmentHeaderParam).join(',');
    }

    private static generateFragmentHeaderParam(param: GraphQLParam): string {
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
            const value: object | string = fieldsObject[key];
            if (typeof (value) === 'object') {
                params.push(key, '{', ...this.generateFragmentFieldsString(value as GraphQLField), '}');
            } else {
                params.push(key);
            }
            return params;
        }, []);
    }

    public generateRequestString(requests: GraphQLRequest[]): string {
        GraphqlGenerator.validateRequests(requests);
        const queryHeader = this.generateRequestHeader(requests);
        const queryFragments = this.generateRequestFragments(requests);

        return `${queryHeader}{\n${queryFragments}}`;
    }
}

export default GraphqlGenerator;
