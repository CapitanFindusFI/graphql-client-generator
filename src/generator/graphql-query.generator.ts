import GraphqlGenerator = require("./graphql.generator");

class GraphqlQueryGenerator extends GraphqlGenerator {
    constructor() {
        super("query");
    }
}

export default GraphqlQueryGenerator;


