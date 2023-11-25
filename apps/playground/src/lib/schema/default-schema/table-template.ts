export const defaultTableSchemaTemplate = `{
  "name": "Base Table",
  "type": "query-search-table",
  "options": {
    "search": [],
    "fields": [
      {
        "key": "cloud_service_id",
        "name": "Cloud Service ID",
        "options": {
          "is_optional": true
        }
      },
      {
        "key": "name",
        "name": "Name"
      },
      {
        "key": "reference.resource_id",
        "name": "Resource ID",
        "options": {
          "is_optional": true
        }
      },
      {
        "key": "state",
        "name": "Collection State",
        "type": "enum",
        "options": {
          "is_optional": true,
          "items": {
            "ACTIVE": {
              "name": "Active",
              "type": "state",
              "options": {
                "icon": {
                  "color": "green.500"
                }
              }
            },
            "DELETED": {
              "name": "Deleted",
              "type": "state",
              "options": {
                "text_color": "gray.500",
                "icon": {
                  "color": "gray.500"
                }
              }
            }
          }
        }
      },
      <% fields.forEach(function(field){ %>
      <%- JSON.stringify(field) %>,
      <% }); %>
      {
        "key": "provider",
        "name": "Provider",
        "reference": {
          "resource_type": "identity.Provider",
          "reference_key": "provider"
        }
      },
      {
        "key": "cloud_service_group",
        "name": "Cloud Service Group",
        "options": {
          "is_optional": true
        }
      },
      {
        "key": "cloud_service_type",
        "name": "Cloud Service Type",
        "options": {
          "is_optional": true
        }
      },
      {
        "key": "region_code",
        "name": "Region",
        "reference": {
          "resource_type": "inventory.Region",
          "reference_key": "region_code"
        }
      },
      {
        "key": "project_id",
        "name": "Project",
        "options": {
          "sortable": false
        },
        "reference": {
          "resource_type": "identity.Project",
          "reference_key": "project_id"
        }
      },
      {
        "key": "collection_info.service_account_id",
        "name": "Service Accounts",
        "options": {
          "is_optional": true
        },
        "reference": {
          "resource_type": "identity.ServiceAccount",
          "reference_key": "service_account_id"
        }
      },
      {
        "key": "collection_info.secret_id",
        "name": "Secrets",
        "options": {
          "is_optional": true
        },
        "reference": {
          "resource_type": "secret.Secret",
          "reference_key": "secret_id"
        }
      },
      {
        "key": "collection_info.collector_id",
        "name": "Collectors",
        "options": {
          "is_optional": true
        },
        "reference": {
          "resource_type": "inventory.Collector",
          "reference_key": "collector_id"
        }
      },
      {
        "key": "updated_at",
        "name": "Last Collected",
        "type": "datetime",
        "options": {
          "source_type": "iso8601"
        }
      },
      {
        "key": "created_at",
        "name": "Created",
        "type": "datetime",
        "options": {
          "source_type": "iso8601",
          "is_optional": true
        }
      },
      {

        "key": "deleted_at",
        "name": "Deleted",
        "type": "datetime",
        "options": {
          "source_type": "iso8601",
          "is_optional": true
        }
      }
    ]
  }
}`;
