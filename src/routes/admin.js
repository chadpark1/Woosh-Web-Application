const express = require('express');
const router = express.Router();

// Get all users (admin only)
router.get('/users', 
  authenticateToken, 
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const result = await db.query(
        'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      res.json({ users: result.rows });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Update user role (admin only)
router.put('/users/:userId/role', 
  authenticateToken, 
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Validate role
      if (!['admin', 'driver', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Prevent admin from removing their own admin role
      if (parseInt(userId) === req.user.id && role !== 'admin') {
        return res.status(400).json({ 
          error: 'Cannot remove your own admin privileges' 
        });
      }

      const result = await db.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ 
        message: 'Role updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

// Delete user (admin only)
router.delete('/users/:userId', 
  authenticateToken, 
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ 
          error: 'Cannot delete your own account' 
        });
      }

      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);
