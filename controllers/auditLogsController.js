const db = require("../models");
const { AuditLogs } = db;

module.exports = async function auditLogs({
  entity_type,
  entity_id,
  action,
  changed_by,
  changes,
  description,
}) {
  try {
    await AuditLogs.create({
      entity_type,
      entity_id,
      action,
      changed_by,
      changes: JSON.stringify(changes),
      description,
    });
  } catch (error) {
    console.error("Audit Log Error", error.message);
  }
};
