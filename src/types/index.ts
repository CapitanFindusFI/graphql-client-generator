export type GraphQLField = { [k: string]: string | object };
export type GraphQLValueItem = string | number | boolean | object;
export type GraphQLValue = { [k: string]: GraphQLValueItem };
export type GraphQLRequestType = "mutation" | "query";
