import test from "node:test";
import assert from "node:assert/strict";

import {
  deduplicateEvents,
  EVENT_TYPES
} from "../src/cyber/events.js";

import {
  reduceCyberStatus
} from "../src/cyber/reducer.js";

test("supported event types remain explicitly controlled", () => {
  assert.equal(EVENT_TYPES.has("kernel:integrity_check_pass"), true);
  assert.equal(EVENT_TYPES.has("unknown:event"), false);
});

test("events are validated, deduplicated, and ordered", () => {
  const events = [
    {
      eventId: "event-2",
      type: "kernel:login_failed",
      at: "2026-09-14T10:01:00Z"
    },
    {
      eventId: "event-1",
      type: "kernel:integrity_check_pass",
      at: "2026-09-14T10:00:00Z"
    },
    {
      eventId: "event-1",
      type: "kernel:integrity_check_fail",
      at: "2026-09-14T10:02:00Z"
    },
    {
      eventId: "event-invalid",
      type: "unknown:event",
      at: "2026-09-14T10:03:00Z"
    }
  ];

  const result = deduplicateEvents(events);

  assert.deepEqual(
    result.map((event) => event.eventId),
    ["event-1", "event-2"]
  );
});

test("cyber status tracks integrity, login failures, and alerts", () => {
  const events = [
    {
      eventId: "1",
      type: "kernel:integrity_check_pass",
      at: "2026-09-14T10:00:00Z"
    },
    {
      eventId: "2",
      type: "kernel:login_failed",
      at: "2026-09-14T10:01:00Z"
    },
    {
      eventId: "3",
      type: "module:alert_raised",
      alertId: "alert-1",
      moduleId: "ntn",
      level: "error",
      at: "2026-09-14T10:02:00Z"
    }
  ];

  const status = reduceCyberStatus(events);

  assert.equal(status.integrityStatus, "ok");
  assert.equal(status.failedLogins, 1);
  assert.equal(status.activeAlerts, 1);
  assert.equal(status.alerts[0].alertId, "alert-1");
});

test("cleared alerts are removed", () => {
  const status = reduceCyberStatus([
    {
      eventId: "1",
      type: "module:alert_raised",
      alertId: "alert-1",
      at: "2026-09-14T10:00:00Z"
    },
    {
      eventId: "2",
      type: "module:alert_cleared",
      alertId: "alert-1",
      at: "2026-09-14T10:01:00Z"
    }
  ]);

  assert.equal(status.activeAlerts, 0);
  assert.deepEqual(status.alerts, []);
});