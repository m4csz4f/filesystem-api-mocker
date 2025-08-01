# Test Mock Files - Usage Examples

This directory contains example mock files that demonstrate how to structure your API mocks for the filesystem-based API mocker.

## Directory Structure

```
test-mocks/
├── users/                          # User management endpoints
│   ├── GET.json                   # List all users (static JSON)
│   ├── POST.js                    # Create user (dynamic handler)
│   └── __id__/                    # Parameterized routes (/users/:id)
│       ├── GET.js                 # Get user by ID (dynamic)
│       └── PUT.js                 # Update user by ID (dynamic)
├── products/                       # Product catalog
│   └── GET.json                   # List products (static JSON)
├── wild/                          # Wildcard/catch-all examples
│   ├── ANY.js                     # Handles any HTTP method to /wild
│   └── __static__/                # Parameterized route (/wild/:static)
│       └── ANY.json               # Static response for /wild/anything
└── api/v1/health/                 # Nested API structure
    └── GET.json                   # Health check endpoint
```

## File Naming Convention

### HTTP Method Files

- `GET.json` - Static JSON response for GET requests
- `POST.js` - Dynamic JavaScript handler for POST requests
- `PUT.js` - Dynamic JavaScript handler for PUT requests
- `DELETE.js` - Dynamic JavaScript handler for DELETE requests
- `ANY.js` - Wildcard handler for any HTTP method
- `ANY.json` - Static wildcard response

### Parameterized Routes

- `__paramName__/` - Directory represents a URL parameter
- Example: `/users/__id__/GET.js` handles `/users/123`, `/users/456`, etc.
- Parameters are available in `req.params.paramName`

## Route Examples

### Direct Routes

- `GET /wild` → uses `/wild/ANY.js`
- `POST /wild` → uses `/wild/ANY.js`
- `PUT /wild` → uses `/wild/ANY.js`

### Parameterized Routes

- `GET /wild/something` → uses `/wild/__static__/ANY.json` (static="something")
- `GET /wild/foo` → uses `/wild/__static__/ANY.json` (static="foo")
- `GET /users/123` → uses `/users/__id__/GET.js` (id="123")

### Invalid/404 Routes

- `GET /wild/__static__/anything` → 404 (no further nesting allowed)
- `GET /nonexistent` → 404 (no matching directory)

## Handler Priority (Highest to Lowest)

1. **Specific method handlers** (e.g., `GET.js`, `POST.js`)
2. **Wildcard JS handlers** (`ANY.js`)
3. **Specific method JSON** (e.g., `GET.json`, `POST.json`)
4. **Wildcard JSON** (`ANY.json`)
5. **404 Not Found**

## JavaScript Handler Examples

### Basic Handler

```javascript
export default function (req, res) {
  res.json({ message: 'Hello World' });
}
```

### Handler with Parameters

```javascript
export default function (req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const { search } = req.query;

  res.json({ id, name, search });
}
```

### Error Handling

```javascript
export default function (req, res) {
  if (!req.body.email) {
    return res.status(400).json({ error: 'Email required' });
  }
  res.json({ success: true });
}
```

## JSON Response Examples

### Simple Response

```json
{
  "message": "Hello World",
  "timestamp": "2025-08-01T12:00:00Z"
}
```

### List Response with Metadata

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## Testing with These Mocks

These files are used by the test suite and also serve as examples for:

1. **API Documentation** - Show expected request/response formats
2. **Frontend Development** - Provide realistic mock data
3. **Integration Testing** - Test various scenarios and edge cases
4. **API Design** - Prototype new endpoints quickly

## Usage in Your Application

Copy this structure to your own mock directory and customize:

1. **Replace test data** with your actual API responses
2. **Add authentication** logic in JS handlers if needed
3. **Implement business logic** for complex operations
4. **Add validation** and error handling as required
