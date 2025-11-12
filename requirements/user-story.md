````markdown
# User Story: View Standards within a Standard Set

**ID:** ICR-123

As a developer, I want to view the individual standards that make up a specific standard set, so that I can understand its detailed rules and classifications.

---

# User Story: Navigate to Standard Set Details

**ID:** ICR-124

As a developer, I want to navigate from the list of standard sets to a detailed view of a specific set, so that I can easily explore its contents.

---

# Acceptance Criteria

### Scenario: Navigate from the Standard Set list to the details page

**Given** I am on the `/standards/standard-sets` page
**When** I click on the link for a standard set named "test-standards-set"
**Then** I am navigated to the `/standards/standard-sets/6798e6aee5152baa5eb4890a` page.

### Scenario: View the details of a Standard Set

**Given** I am on the details page for the "test-standards-set"
**When** the page has loaded
**Then** I should see an `<h1>` page heading with the text "test-standards-set"
**And** I should see a link with the text "https://github.com/ee-todd/test-standards-set (opens in new tab)"
**And** the link should open in a new browser tab.
**And** I should see a table with the columns "Standard" and "Classifications".

### Scenario: View a Standard within the details table

**Given** I am on the details page for the "test-standards-set"
**When** I view the standards table
**Then** I should see a row containing a `govuk-details` component with the summary text "JavaScript Coding Standards"
**And** the "Classifications" cell for that row should contain a blue `govuk-tag` with the text "Javascript".
**When** I click to expand the "JavaScript Coding Standards" details component
**Then** I should see the full rendered markdown content for that standard.

---

# Interface Design

This feature will adhere to the GDS Design System and accessibility standards (WCAG 2.1).

### New Page: `/standards/standard-sets/{id}`

- **Page Title**: The `<title>` of the page will be "{Standard Set Name} - Intelligent Code Reviewer - GOV.UK".
- **Main Heading**: A `govuk-heading-l` will display the standard set name.
- **Body Content**: A `govuk-body` paragraph will display the repository URL as a `govuk-link`. The link will include `(opens in new tab)` in its text and have the `target="_blank"` attribute.
- **Standards Table**: A `govuk-table` will be used to display the list of standards with two columns: "Standard" and "Classifications".
  - The "Standard" cell will contain a `govuk-details` component.
  - The "Classifications" cell will contain one or more `govuk-tag` components (blue).

### Updated Page: `/standards/standard-sets`

- The existing `govuk-table` on this page will be updated. The text in the first column (Standard Set Name) will be converted into a `govuk-link` pointing to the new details page.

### GDS Components Required:

- `govuk-heading`
- `govuk-body`
- `govuk-link`
- `govuk-table`
- `govuk-details`
- `govuk-tag`

---

# Technical Design

### 1. Routing (Hapi.js)

- A new route will be created:
  ```javascript
  server.route({
    method: 'GET',
    path: '/standards/standard-sets/{id}',
    handler: standardSetDetailHandler
  })
  ```
- The `standardSetDetailHandler` will orchestrate the API calls, data processing, and rendering of the Nunjucks template.
- The existing route handler for `/standards/standard-sets` will be updated to modify the data passed to its template, ensuring each standard set includes its detail page URL.

### 2. Data Fetching and Processing

- The `standardSetDetailHandler` will perform two concurrent API calls:
  1.  `GET /api/v1/standard-sets/{id}` to fetch the details for the specific standard set.
  2.  `GET /api/v1/classifications` to fetch all available classifications.
- A map/lookup object will be created from the classifications response, mapping `classification._id` to `classification.name`.
- The `standards` array from the standard set response will be processed:
  - For each `standard`, its `classification_ids` array will be used to look up the corresponding names from the classification map.
  - The `marked` library will be used to parse the `standard.text` (markdown). The first token of type `heading` will be extracted to be used as the summary text for the `govuk-details` component. The full `standard.text` will be rendered into HTML to be placed inside the `govuk-details` component body.

### 3. Templating (Nunjucks)

- A new Nunjucks template will be created for the `/standards/standard-sets/{id}` page.
- The template will receive the processed standard set data, including the name, repository URL, and the enriched list of standards (with classification names and markdown summary text).
- It will use a `for` loop to iterate over the `standards` array and generate a `govuk-table` row for each one.
- Inside the loop, it will call the `govukDetails` and `govukTag` Nunjucks macros from `govuk-frontend`.
- The existing template for `/standards/standard-sets` will be updated to render a `govuk-link` in the name column of its table.

### 4. API Responses

The functionality will consume the following API responses.

#### **`GET /api/v1/standard-sets/{standard_set_id}`**

```json
{
  "name": "test-standards-set",
  "repository_url": "[https://github.com/ee-todd/test-standards-set](https://github.com/ee-todd/test-standards-set)",
  "custom_prompt": "",
  "_id": "6798e6aee5152baa5eb4890a",
  "created_at": "2025-01-28T14:16:14.492000",
  "updated_at": "2025-01-28T14:16:14.492000",
  "standards": [
    {
      "_id": "6798e6b6e4a8cc3eb27f0409",
      "text": "# JavaScript Coding Standards\n\n## 1. **Code Structure**\n- Use meaningful and descriptive names for variables, functions, and classes.\n- Organise code into reusable modules or components.\n- Follow the single responsibility principle (SRP) for functions and classes.\n",
      "repository_path": "javascript_standards.md",
      "standard_set_id": "6798e6aee5152baa5eb4890a",
      "classification_ids": ["6798f38a1cb87d7c7420b540"]
    }
  ]
}
```
````

#### **`GET /api/v1/classifications`**

```json
[
  {
    "name": "Javascript",
    "_id": "6798f38a1cb87d7c7420b540",
    "created_at": "2025-01-28T15:11:06.111000",
    "updated_at": "2025-01-28T15:11:06.111000"
  },
  {
    "name": "Node.js",
    "_id": "6798f3911cb87d7c7420b546",
    "created_at": "2025-01-28T15:11:13.289000",
    "updated_at": "2025-01-28T15:11:13.289000"
  }
]
```

```

```
