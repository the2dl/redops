const express = require('express');
const passport = require('passport');
const { pool } = require('../db/config');

const router = express.Router();

// Get all operations
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        COUNT(DISTINCT cf.id) as critical_findings_count,
        COUNT(DISTINCT d.id) as detections_count,
        COUNT(DISTINCT ot.technique_id) as techniques_count
      FROM operations o
      LEFT JOIN critical_findings cf ON cf.operation_id = o.id
      LEFT JOIN detections d ON d.operation_id = o.id
      LEFT JOIN operation_techniques ot ON ot.operation_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
});

// Get single operation with all related data
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get operation details
    const operationResult = await pool.query(`
      SELECT * FROM operations WHERE id = $1
    `, [id]);

    if (!operationResult.rows[0]) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // Get critical findings
    const findingsResult = await pool.query(`
      SELECT * FROM critical_findings WHERE operation_id = $1
      ORDER BY timestamp DESC
    `, [id]);

    // Get detections
    const detectionsResult = await pool.query(`
      SELECT * FROM detections WHERE operation_id = $1
      ORDER BY timestamp DESC
    `, [id]);

    // Get techniques with details
    const techniquesResult = await pool.query(`
      SELECT t.* FROM techniques t
      JOIN operation_techniques ot ON ot.technique_id = t.id
      WHERE ot.operation_id = $1
    `, [id]);

    // Get team members
    const teamResult = await pool.query(`
      SELECT tm.* FROM team_members tm
      JOIN operation_team_members otm ON otm.team_member_id = tm.id
      WHERE otm.operation_id = $1
    `, [id]);

    res.json({
      ...operationResult.rows[0],
      criticalFindings: findingsResult.rows,
      detections: detectionsResult.rows,
      techniques: techniquesResult.rows,
      team: teamResult.rows
    });
  } catch (error) {
    console.error('Error fetching operation:', error);
    res.status(500).json({ error: 'Failed to fetch operation details' });
  }
});

// Create new operation
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, target, status, startDate, team, techniques } = req.body;
    
    // Create operation
    const operationResult = await client.query(`
      INSERT INTO operations (name, target, status, start_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, target, status, startDate]);

    const operationId = operationResult.rows[0].id;

    // Add team members
    if (team?.length) {
      await Promise.all(team.map(member => 
        client.query(`
          INSERT INTO operation_team_members (operation_id, team_member_id)
          VALUES ($1, $2)
        `, [operationId, member.id])
      ));
    }

    // Add techniques
    if (techniques?.length) {
      await Promise.all(techniques.map(technique => 
        client.query(`
          INSERT INTO operation_techniques (operation_id, technique_id)
          VALUES ($1, $2)
        `, [operationId, technique])
      ));
    }

    await client.query('COMMIT');
    res.status(201).json(operationResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating operation:', error);
    res.status(500).json({ error: 'Failed to create operation' });
  } finally {
    client.release();
  }
});

// Update operation status
router.patch('/:id/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endDate, successRate } = req.body;

    const result = await pool.query(`
      UPDATE operations 
      SET status = $1, 
          end_date = $2,
          success_rate = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, endDate, successRate, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating operation status:', error);
    res.status(500).json({ error: 'Failed to update operation status' });
  }
});

module.exports = router; 