import {GraphQLValue} from "../types";

export interface IGraphQLRequest {
    fragmentName: string;
    fragmentParams?: IGraphQLParam[];
    fragmentFields: string[];
    fragmentValues?: GraphQLValue;
}

export interface IGraphQLParam {
    name: string;
    alias?: string;
    type: string;
}

export interface IGraphQLQueryRequest extends IGraphQLRequest {
    fragmentParams?: IGraphQLParam[];
    fragmentFields: string[];
    fragmentValues?: GraphQLValue;
}

export interface IGraphQLMutationRequest extends IGraphQLRequest {
    fragmentParams?: IGraphQLParam[];
    fragmentValues?: GraphQLValue;
}
