// Example parameterized route handler
// URL: /users/:id -> /users/__id__/GET.js
export default function (req, res) {
  const userId = req.params.id;

  // Simulate user lookup
  const user = {
    id: userId,
    name: `Test User ${userId}`,
    email: `user${userId}@example.com`,
    role: userId === '1' ? 'admin' : 'user',
    profile: {
      bio: `This is test user ${userId}`,
      joinDate: '2024-01-15',
      lastActive: new Date().toISOString(),
    },
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  };

  // Simulate 404 for high IDs
  if (parseInt(userId) > 999) {
    return res.status(404).json({
      error: 'User not found',
      userId: userId,
    });
  }

  res.json(user);
}
