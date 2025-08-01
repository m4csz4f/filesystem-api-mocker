// Example POST handler for creating users
export default function (req, res) {
  const { name, email, role = 'user' } = req.body;

  // Simulate validation
  if (!name || !email) {
    return res.status(400).json({
      error: 'Name and email are required',
      code: 'VALIDATION_ERROR',
    });
  }

  // Simulate user creation
  const newUser = {
    id: Math.floor(Math.random() * 1000) + 100,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
    body: req.body, // For testing purposes
  });
}
