import {IGraphQLParam, IGraphQLQueryRequest} from "../../src/interfaces/graphql-request.interface";
import _ = require('lodash');

const extractRequestsParameters = (requests: IGraphQLQueryRequest[]) => {
    return requests.reduce((params: IGraphQLParam[], request: IGraphQLQueryRequest) => {
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

const generateQueryRequest = (requests: IGraphQLQueryRequest[]) => {
    const requestParams = extractRequestsParameters(requests);
    const queryHeader = generateQueryHeader(requestParams);
    const queryFragments = generateQueryFragments(requests);
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

const generateQueryFragments = (requests: IGraphQLQueryRequest[]) => {
    return requests.map(generateQueryFragment).join('\n');
};

const generateQueryFragment = (request: IGraphQLQueryRequest): string => {
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

const generateFragmentFields = (fields: string[]) => {
    const fieldsObject: object = {};
    fields.forEach(field => _.set(fieldsObject, field, field));

    const fieldsList = unwrapItem(fieldsObject);

    return fieldsList.join(' ');
};

const unwrapItem = (item: any): string[] => {
    let unwrappedQuery: string[] = [];
    Object.keys(item).forEach((key: string) => {
        const itemValue: any = item[key];
        if (_.isObject(itemValue)) {
            unwrappedQuery = unwrappedQuery.concat(key, '{', unwrapItem(itemValue), '}');
        } else {
            unwrappedQuery.push(key);
        }
    });
    return unwrappedQuery;
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
    unwrapItem
}
