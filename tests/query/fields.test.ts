import {generateFragmentFields} from "../utils";

describe('query fragments generator test suite', () => {

    it('should generate query with a single field', () => {
        const fields = ['id'];
        const queryFields: string = generateFragmentFields(fields);
        expect(queryFields).toBe('id');
    });

    it('should generate query with multiple fields', () => {
        const fields = ['id', 'name', 'surname'];
        const queryFields: string = generateFragmentFields(fields);
        expect(queryFields).toBe('id name surname');
    });

    it('should generate query with a nested field', () => {
        const fields = ['id', 'user.name', 'user.surname'];
        const queryFields: string = generateFragmentFields(fields);
        expect(queryFields).toBe('id user { name surname }');
    });

    it('should generate query with unordered nested fields', () => {
        const fields = ['user.name', 'id', 'user.surname', 'createdAt'];
        const queryFields = generateFragmentFields(fields);
        expect(queryFields).toBe('user { name surname } id createdAt');
    });

    it('should generate query with another set of unordered nested fields', () => {
        const fields = ['id', 'user.name', 'createdAt', 'user.surname', 'user.picture.url', 'updatedAt', 'user.picture.size'];
        const queryFields = generateFragmentFields(fields);
        expect(queryFields).toBe('id user { name surname picture { url size } } createdAt updatedAt');
    });
});
