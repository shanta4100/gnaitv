export const EVENT_TYPES = new Set([
  'kernel:start',
  'kernel:login_success',
  'kernel:login_failed',
  'kernel:integrity_check_pass',
  'kernel:integrity_check_fail',
  'module:health_change',
  'module:alert_raised',
  'module:alert_cleared'
]);

export function deduplicateEvents(events) {
  const uniqueEvents = new Map();

  for (const event of events) {
    if (!event?.eventId || uniqueEvents.has(event.eventId)) continue;
    if (!EVENT_TYPES.has(event.type)) continue;
    if (!Number.isFinite(Date.parse(event.at))) continue;
    uniqueEvents.set(event.eventId, event);
  }

  return [...uniqueEvents.values()].sort((left, right) => {
    const timeDifference = Date.parse(left.at) - Date.parse(right.at);
    return timeDifference || left.eventId.localeCompare(right.eventId);
  });
}
