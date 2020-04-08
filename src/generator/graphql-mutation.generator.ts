import GraphqlGenerator = require("./graphql.generator");

class GraphqlMutationGenerator extends GraphqlGenerator {
    constructor() {
        super("mutation");
    }
}

export default GraphqlMutationGenerator;


