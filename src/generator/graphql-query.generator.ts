import {IGraphQLRequest} from "../interfaces/graphql-request.interface";
import GraphqlGenerator from "./graphql.generator";

class GraphqlQueryGenerator extends GraphqlGenerator {
    constructor(requests: IGraphQLRequest[]) {
        super('query', requests);
    }
}

export default GraphqlGenerator;


