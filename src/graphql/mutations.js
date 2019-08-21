import gql from 'graphql-tag';

gql`input UserInput {
  name: String!
  sortable_name: String!
  short_name: String!
  email: String
  time_zone: String
  unique_id: String
  path: String
  sis_user_id: String
  send_confirmation: String
}
`;

export const CREATE_USER = gql`
    mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
          id,
          name
        }
    }
`;

export const UPDATE_USER = gql`
    mutation UpdateUser($id: Int!, $input: UserInput!) {
      updateUser(id: $id, input: $input)
        {
          id,
          name
        }
    }
`;