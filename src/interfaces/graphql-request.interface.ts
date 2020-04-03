export interface IGraphQLRequest {
    fragmentName: string;
}

export interface IGraphQLParam {
    name: string;
    alias?: string;
    type: string;
}

export interface IGraphQLQueryRequest extends IGraphQLRequest {
    fragmentParams?: IGraphQLParam[];
    fragmentFields: string[];
    fragmentValues?: object;
}

export interface IGraphQLMutationRequest extends IGraphQLRequest {
    fragmentParams: IGraphQLParam[];
    fragmentValues: object;
}
