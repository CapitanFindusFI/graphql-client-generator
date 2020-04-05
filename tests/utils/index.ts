import {IGraphQLParam, IGraphQLRequest} from "../../src/interfaces/graphql-request.interface";
import {GraphQLField} from "../../src/types";
import _ = require('lodash');

const extractRequestsParameters = (requests: IGraphQLRequest[]) => {
    return requests.reduce((params: IGraphQLParam[], request: IGraphQLRequest) => {
        const {fragmentParams} = request;
        if (!_.isUndefined(fragmentParams) && fragmentParams.length) {
            return params.concat(...fragmentParams);
        } else {
            return params;
        }
    }, []);
};

const generateParameterAlias = (param: IGraphQLParam) => {
    const {name, alias} = param;
    if (!name) throw new Error('Missing required param name');

    return alias ? alias : `$${name}`;
};

const generateQueryRequest = (requests: IGraphQLRequest[]): string => {
    const requestParams = extractRequestsParameters(requests);
    const queryHeader = generateQueryHeader(requestParams);
    const queryFragments = generateQueryFragments(requests);

    return `${queryHeader}{\n${queryFragments}}`;
};

const generateQueryHeader = (params: IGraphQLParam[]) => {
    return `query(${collectHeaderParams(params)})`;
};

const collectHeaderParams = (params: IGraphQLParam[]): string => {
    return params.map(collectHeaderParam).join(',');
};

const collectHeaderParam = (param: IGraphQLParam): string => {
    if (!param.type) throw new Error('Missing required type for parameter');

    const useAlias = generateParameterAlias(param);
    return [useAlias, param.type].join(':');
};

const generateQueryFragments = (requests: IGraphQLRequest[]) => {
    return requests.map(generateQueryFragment).join('\n');
};

const generateQueryFragment = (request: IGraphQLRequest): string => {
    const {fragmentName, fragmentParams, fragmentFields} = request;
    const fragmentHeader = generateFragmentHeader(fragmentName, fragmentParams);
    const fragmentBody = generateFragmentFields(fragmentFields);

    return `${fragmentHeader}{${fragmentBody}}`;
};

const generateFragmentHeader = (name: string, params: IGraphQLParam[] = []) => {
    let fragmentHeader: string = name;
    if (params.length) fragmentHeader += `(${generateFragmentParams(params)})`;
    return fragmentHeader;
};

const generateFragmentParams = (params: IGraphQLParam[]) => {
    return params.map(collectFragmentParam);
};

const collectFragmentParam = (param: IGraphQLParam): string => {
    const useAlias = generateParameterAlias(param);
    return [param.name, useAlias].join(':');
};

const generateFragmentFields = (fields: string[]): string => {
    const fieldsObject: GraphQLField = collectFieldsAsObject(fields);
    const fragmentBodyComponents: string[] = generateFragmentFieldsString(fieldsObject);
    return fragmentBodyComponents.join(' ');
};

const collectFieldsAsObject = (fields: string[]): GraphQLField => {
    return fields.reduce((object: object, field: string) => {
        _.set(object, field, field);
        return object;
    }, {});
};

const generateFragmentFieldsString = (fieldsObject: GraphQLField) => {
    return Object.keys(fieldsObject).reduce((params: string[], key: string) => {
        const value: any = fieldsObject[key];
        if (typeof (value) === 'object') {
            params.push(key, '{', ...generateFragmentFieldsString(value), '}');
        } else if (typeof (value) === 'string') {
            params.push(key);
        } else {
            throw new Error(`Unknown field: ${key}`)
        }
        return params;
    }, []);
};

export {
    extractRequestsParameters,
    generateParameterAlias,
    generateQueryRequest,
    generateQueryHeader,
    collectHeaderParams,
    collectHeaderParam,
    generateFragmentHeader,
    generateQueryFragments,
    collectFragmentParam,
    generateFragmentFields,
    generateFragmentFieldsString
}
