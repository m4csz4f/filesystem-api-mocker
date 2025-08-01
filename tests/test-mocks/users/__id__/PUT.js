// Example UPDATE handler for user profile
// URL: /users/:id -> /users/__id__/PUT.js
export default function (req, res) {
  const userId = req.params.id;
  const updates = req.body;

  // Simulate update validation
  const allowedFields = ['name', 'email', 'bio', 'preferences'];
  const updateFields = Object.keys(updates).filter(key =>
    allowedFields.includes(key),
  );

  if (updateFields.length === 0) {
    return res.status(400).json({
      error: 'No valid fields to update',
      allowedFields,
    });
  }

  // Simulate updated user
  const updatedUser = {
    id: userId,
    name: updates.name || `User ${userId}`,
    email: updates.email || `user${userId}@example.com`,
    bio: updates.bio || 'No bio provided',
    preferences: { ...updates.preferences },
    updatedAt: new Date().toISOString(),
  };

  res.json({
    message: 'User updated successfully',
    user: updatedUser,
    updatedFields: updateFields,
  });
}
