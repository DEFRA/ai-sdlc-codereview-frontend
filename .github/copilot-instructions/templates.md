---
applyTo: "**/*.njk"
---

# Nunjucks Template Instructions

This file provides specific guidance for working with Nunjucks template files (`*.njk`) in this DEFRA GOV.UK Frontend application.

## Project Context

This is a **server-side rendered application** using:
- **Nunjucks** templating engine with GOV.UK Frontend components
- **Template inheritance** with `layouts/page.njk` as the base
- **GOV.UK Design System** components and styling
- **Accessibility-first** approach with proper ARIA labels and semantic HTML

## Template Structure Patterns

### Standard Template Layout
```njk
{% extends "layouts/page.njk" %}

{% from "govuk/components/button/macro.njk" import govukButton %}
{% from "govuk/components/table/macro.njk" import govukTable %}
{% from "govuk/components/tag/macro.njk" import govukTag %}
{% from "govuk/components/summary-list/macro.njk" import govukSummaryList %}
{% from "govuk/components/tabs/macro.njk" import govukTabs %}

{% block pageTitle %}Page Title - Intelligent Code Reviewer{% endblock %}

{% block content %}
  <div class="govuk-width-container">
    <h1 class="govuk-heading-l">Page Heading</h1>
    <!-- Content here -->
  </div>
{% endblock %}
```

### Required Template Blocks
- **`pageTitle`**: Always include with " - Intelligent Code Reviewer" suffix
- **`content`**: Main content area wrapped in `govuk-width-container`
- **`beforeContent`**: For breadcrumbs and back links (optional)

## GOV.UK Component Usage Patterns

### Tables with Data Labels
Format data specifically for the `govukTable` macro:
```njk
{{ govukTable({
  caption: "Code Reviews",
  captionClasses: "govuk-table__caption--l",
  head: [
    { text: "Code Repository" },
    { text: "Created" },
    { text: "Updated" },
    { text: "Status" }
  ],
  rows: tableRows
}) }}
```

**Controller must format data as:**
```javascript
const tableRows = data.map(item => [
  {
    html: `<a href="/link" class="govuk-link">${item.url}</a>`,
    attributes: { 'data-label': 'Code Repository' }
  },
  {
    html: `<time datetime="${item.created}">${formatDate(item.created)}</time>`,
    attributes: { 'data-label': 'Created' }
  }
])
```

### Status Tags with Colors
```njk
{{ govukTag({
  text: review.status | replace("_", " ") | title,
  classes: "govuk-tag--" + (
    review.status | lower == "failed" and "red" or 
    (review.status | lower == "completed" and "green" or "blue")
  ),
  attributes: {
    "role": "status",
    "aria-label": "Review status: " + (review.status | replace("_", " ") | title),
    "data-review-id": review._id
  }
}) }}
```

### Summary Lists for Details Pages
```njk
{{ govukSummaryList({
  role: "contentinfo",
  ariaLabel: "Code review information",
  rows: [
    {
      key: {
        text: "Code Repository",
        classes: "govuk-!-width-one-third"
      },
      value: {
        html: '<a href="' + review.repository_url + '" class="govuk-link" target="_blank" rel="noopener noreferrer">' + review.repository_url + ' (opens in new tab)</a>',
        classes: "govuk-!-width-two-thirds"
      }
    }
  ]
}) }}
```

### Tabs for Multiple Content Sections
```njk
{% if review.compliance_reports and review.compliance_reports | length > 0 %}
  {% set tabItems = [] %}
  {% for report in review.compliance_reports %}
    {% set _ = tabItems.push({
      label: report.standard_set_name,
      id: "compliance-report-" + loop.index,
      panel: {
        html: '<div class="govuk-body">' + report.report | safe + '</div>'
      }
    }) %}
  {% endfor %}

  {{ govukTabs({
    idPrefix: "compliance-reports",
    items: tabItems
  }) }}
{% endif %}
```

## Data Formatting in Templates

### Date Display
Use the `formatDate()` function from controllers (don't format dates in templates):
```njk
<!-- Controller formats: "14 January 2024 at 2:00pm" -->
<time datetime="{{ review.created_at }}">{{ review.formatted_created_at }}</time>
```

### Markdown Content
Use the `markdown` filter for user content, always marked as safe:
```njk
<div class="govuk-body">{{ report.content | markdown | safe }}</div>
```

### Status Text Formatting
```njk
<!-- Replace underscores and title case -->
{{ review.status | replace("_", " ") | title }}
```

## Accessibility Patterns

### Semantic HTML and ARIA
```njk
<!-- Status indicators -->
<strong class="govuk-tag" role="status" aria-label="Review status: {{ status }}">
  {{ status }}
</strong>

<!-- External links -->
<a href="{{ url }}" class="govuk-link" target="_blank" rel="noopener noreferrer">
  {{ text }} (opens in new tab)
</a>

<!-- Navigation links -->
<a href="/code-reviews" class="govuk-link" aria-label="Return to code reviews list">
  Back to code reviews
</a>
```

### Proper Heading Hierarchy
```njk
<!-- Always start with h1 -->
<h1 class="govuk-heading-l">Main Page Title</h1>

<!-- Subsections use h2 -->
<h2 class="govuk-heading-m">Subsection</h2>

<!-- Details use h3 -->
<h3 class="govuk-heading-s">Detail Section</h3>
```

## Error and Empty States

### Error Messages
```njk
{% if error %}
  <div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
    <h2 class="govuk-error-summary__title" id="error-summary-title">
      There is a problem
    </h2>
    <div class="govuk-error-summary__body">
      <p class="govuk-body">{{ error.message }}</p>
    </div>
  </div>
{% endif %}
```

### Empty States
```njk
{% if items and items | length > 0 %}
  <!-- Display items -->
{% else %}
  <div class="govuk-inset-text" role="region" aria-label="No results">
    <p class="govuk-body">No compliance reports available yet.</p>
    <p class="govuk-body">Reports will appear here once the code review is completed.</p>
  </div>
{% endif %}
```

## Layout and Spacing

### Width Containers
```njk
<!-- Main content wrapper -->
<div class="govuk-width-container">
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <!-- Main content -->
    </div>
    <div class="govuk-grid-column-one-third">
      <!-- Sidebar content -->
    </div>
  </div>
</div>
```

### Consistent Spacing
```njk
<!-- Use GOV.UK spacing classes -->
<div class="govuk-!-margin-bottom-6">Content with bottom margin</div>
<div class="govuk-!-padding-top-4">Content with top padding</div>
```

## Navigation Patterns

### Back Links
```njk
<a href="{{ backUrl }}" class="govuk-back-link">Back</a>
```

### Breadcrumbs (in beforeContent block)
```njk
{% block beforeContent %}
  {{ govukBreadcrumbs({
    items: [
      { text: "Home", href: "/" },
      { text: "Code Reviews", href: "/code-reviews" },
      { text: "Review Details" }
    ]
  }) }}
{% endblock %}
```

## Forms and User Input

### Form Structure
```njk
<form method="post" action="/submit">
  {{ govukInput({
    label: {
      text: "Repository URL",
      classes: "govuk-label--m"
    },
    id: "repository-url",
    name: "repositoryUrl",
    type: "url",
    value: formData.repositoryUrl,
    errorMessage: errors.repositoryUrl
  }) }}

  {{ govukButton({
    text: "Generate code review"
  }) }}
</form>
```

## Template Best Practices

1. **Always import macros at the top** of the template
2. **Use consistent indentation** (2 spaces) for readability
3. **Include ARIA labels** for interactive elements
4. **Wrap content in `govuk-width-container`** for proper layout
5. **Use semantic HTML elements** (time, section, article)
6. **Test with screen readers** in mind
7. **Include loading states** for dynamic content
8. **Use `| safe` filter carefully** only for trusted content

## Common Gotchas

- **Don't format dates in templates** - use formatted data from controllers
- **Always include `role="status"`** for status indicators
- **Use `target="_blank" rel="noopener noreferrer"`** for external links
- **Include data attributes** for JavaScript targeting (`data-review-id`)
- **Test responsive behavior** especially for tables on mobile