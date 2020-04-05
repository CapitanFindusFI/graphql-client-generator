import {IGraphQLParam, IGraphQLQueryRequest, IGraphQLRequest} from "../interfaces/graphql-request.interface";
import {generateParameterAlias} from "../../tests/utils";
import {GraphQLField} from "../types";
import * as _ from "lodash";

abstract class GraphqlGenerator {
    protected requestTypeName: string;
    protected requests: IGraphQLRequest[];

    protected constructor(requestHeader: string, requests: IGraphQLRequest[]) {
        this.requestTypeName = requestHeader;
        this.requests = requests;
    }

    private collectRequestParamters() {
        return this.requests.reduce((params: IGraphQLParam[], request: IGraphQLQueryRequest) => {
            const {fragmentParams} = request;
            if (!_.isUndefined(fragmentParams) && fragmentParams.length) {
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
        return `${this.requestTypeName}(${GraphqlGenerator.collectHeaderParams(params)})`;
    }

    private static collectHeaderParams(params: IGraphQLParam[]): string {
        return params.map(GraphqlGenerator.collectHeaderParam).join(',');
    }

    private static collectHeaderParam(param: IGraphQLParam): string {
        if (!param.type) throw new Error('Missing required param');
        const useAlias = GraphqlGenerator.generateParameterAlias(param);
        return [useAlias, param.type].join(':');
    }

    private generateRequestFragments() {
        return this.requests.map(this.generateRequestFragment.bind(this)).join('\n');
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
            _.set(object, field, field);
            return object;
        }, {});
    }

    private generateFragmentFieldsString(fieldsObject: GraphQLField) {
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

    public generateRequestString(): string {
        const requestParams = this.collectRequestParamters();
        const queryHeader = this.generateRequestHeader(requestParams);
        const queryFragments = this.generateRequestFragments();

        return `${queryHeader}{\n${queryFragments}}`;
    }
}

export default GraphqlGenerator;
