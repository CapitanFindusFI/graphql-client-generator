import {IGraphQLRequest} from "../interfaces/graphql-request.interface";
import GraphqlGenerator from "./graphql.generator";

class GraphqlQueryGenerator extends GraphqlGenerator {
    constructor() {
        super('query');
    }
}

export default GraphqlQueryGenerator;


