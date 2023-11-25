export const defaultSearchSchemaTemplate = `{
  "search": [
    {
      "title":"Properties",
      "items":[
        {
          "key":"cloud_service_id",
          "name":"Cloud Service ID"
        },
        {
          "key":"name",
          "name":"Name"
        },
        {
          "key":"reference.resource_id",
          "name":"Resource ID"
        },
        <% fields.forEach(function(field){ %>
        <%- JSON.stringify(field) %>,
        <% }); %>
        {
          "key":"state",
          "name":"Collection State",
          "enums":{
            "ACTIVE":{
              "label":"Active"
            },
            "DELETED":{
              "label":"Deleted"
            }
          }
        },
        {
          "key":"account",
          "name":"Account"
        },
        {
          "key":"region_code",
          "name":"Region",
          "options": {
            "is_optional": true
          },
          "reference":"inventory.Region"
        },
        {
          "key":"project_id",
          "name":"Project",
          "reference":"identity.Project"
        },
        {
          "key":"project_group_id",
          "name":"Project Group",
          "reference":"identity.ProjectGroup"
        },
        {
          "key":"collection_info.service_account_id",
          "name":"Service Account",
          "reference":"identity.ServiceAccount"
        },
        {
          "key":"collection_info.secret_id",
          "name":"Secret",
          "reference":"secret.Secret"
        },
        {
          "key":"updated_at",
          "name":"Last Collected",
          "data_type":"datetime"
        },
        {
          "key":"created_at",
          "name":"Created",
          "data_type":"datetime"
        },
        {
          "key":"deleted_at",
          "name":"Deleted",
          "data_type":"datetime"
        }
      ]
    },
    {
      "title":"Advanced",
      "items":[
        {
          "key": "tags",
          "name": "Tags",
          "data_type": "object"
        }
      ]
    }
  ]
}`;
