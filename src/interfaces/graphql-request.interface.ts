import {GraphQLValue} from "../types";

export interface GraphQLRequest {
    fragmentName: string;
    fragmentParams?: GraphQLParam[];
    fragmentFields?: string[];
    fragmentValues?: GraphQLValue;
}

export interface GraphQLParam {
    name: string;
    alias?: string;
    type: string;
}

export interface GraphQLQueryRequest extends GraphQLRequest {
    fragmentParams?: GraphQLParam[];
    fragmentFields?: string[];
    fragmentValues?: GraphQLValue;
}

export interface GraphQLMutationRequest extends GraphQLRequest {
    fragmentParams?: GraphQLParam[];
    fragmentValues?: GraphQLValue;
}
