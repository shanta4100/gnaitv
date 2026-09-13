import { deduplicateEvents } from './events.js';

export function reduceCyberStatus(events) {
  const orderedEvents = deduplicateEvents(events);
  const activeAlerts = new Map();
  const status = {
    lastIntegrityCheck: null,
    integrityStatus: 'unknown',
    failedLogins: 0
  };

  for (const event of orderedEvents) {
    if (event.type === 'kernel:integrity_check_pass') {
      status.lastIntegrityCheck = event.at;
      status.integrityStatus = 'ok';
    } else if (event.type === 'kernel:integrity_check_fail') {
      status.lastIntegrityCheck = event.at;
      status.integrityStatus = 'error';
    } else if (event.type === 'kernel:login_failed') {
      status.failedLogins += 1;
    } else if (event.type === 'module:alert_raised' && event.alertId) {
      activeAlerts.set(event.alertId, {
        alertId: event.alertId,
        level: event.level === 'error' ? 'error' : 'warn',
        eventCode: event.eventCode ?? 'MODULE_ALERT',
        at: event.at,
        moduleId: event.moduleId ?? 'unknown'
      });
    } else if (event.type === 'module:alert_cleared' && event.alertId) {
      activeAlerts.delete(event.alertId);
    }
  }

  return Object.freeze({
    ...status,
    activeAlerts: activeAlerts.size,
    alerts: Object.freeze([...activeAlerts.values()])
  });
}
