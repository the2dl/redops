const express = require('express');
const passport = require('passport');
const { pool } = require('../db/config');

const router = express.Router();

// Get commands for operation
router.get('/operation/:operationId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { operationId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.*,
        array_agg(DISTINCT jsonb_build_object('type', ie.entity_type, 'value', ie.value)) as impacted_entities,
        array_agg(DISTINCT ct.technique_id) as mitre_techniques
      FROM commands c
      LEFT JOIN impacted_entities ie ON ie.command_id = c.id
      LEFT JOIN command_techniques ct ON ct.command_id = c.id
      WHERE c.operation_id = $1
      GROUP BY c.id
      ORDER BY c.timestamp DESC
    `, [operationId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

// Add command to operation
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      operationId, 
      command, 
      output, 
      status,
      impactedEntities,
      mitreTechniques 
    } = req.body;

    // Add command
    const commandResult = await client.query(`
      INSERT INTO commands (operation_id, command, output, status, timestamp)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `, [operationId, command, output, status]);

    const commandId = commandResult.rows[0].id;

    // Add impacted entities
    if (impactedEntities?.length) {
      await Promise.all(impactedEntities.map(entity =>
        client.query(`
          INSERT INTO impacted_entities (command_id, entity_type, value)
          VALUES ($1, $2, $3)
        `, [commandId, entity.type, entity.value])
      ));
    }

    // Add MITRE techniques
    if (mitreTechniques?.length) {
      await Promise.all(mitreTechniques.map(technique =>
        client.query(`
          INSERT INTO command_techniques (command_id, technique_id)
          VALUES ($1, $2)
        `, [commandId, technique])
      ));
    }

    await client.query('COMMIT');
    res.status(201).json(commandResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding command:', error);
    res.status(500).json({ error: 'Failed to add command' });
  } finally {
    client.release();
  }
});

module.exports = router; 