router.get('/deliveries', 
  authenticateToken, 
  authorizeRole('driver', 'admin'),
  async (req, res) => {
    // Driver-specific logic
    res.json({ message: 'Driver deliveries page' });
  }
);