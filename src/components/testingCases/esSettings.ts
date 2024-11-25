const yaml = `
analysis:
  analyzer:
    autocomplete_analyzed:
      filter:
        - lowercase
        - edge_ngram
      tokenizer: standard
    autocomplete_prefix:
      filter:
        - lowercase
        - edge_ngram
      tokenizer: keyword
    lowercase_keyword:
      filter:
        - lowercase
      tokenizer: keyword
  filter:
    edge_ngram:
      max_gram: '20'
      min_gram: '1'
      side: front
      type: edge_ngram
index.mapping.nested_fields.limit: 100
number_of_shards: 1
`;
export default yaml;
