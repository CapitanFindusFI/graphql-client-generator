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
