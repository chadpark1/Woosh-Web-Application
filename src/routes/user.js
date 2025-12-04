router.get('/profile', 
  authenticateToken, 
  authorizeRole('user', 'driver', 'admin'),
  async (req, res) => {
    // All authenticated users can access
    res.json({ message: 'User profile page' });
  }
);