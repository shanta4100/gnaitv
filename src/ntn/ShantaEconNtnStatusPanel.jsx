import React from 'react';

export const ShantaEconNtnStatusPanel = ({ moduleStatus }) => {
  const staleAfter = moduleStatus?.staleAfter;
  const observedAt = moduleStatus?.observedAt;

  const fresh =
    Number.isFinite(staleAfter) &&
    observedAt &&
    Date.parse(observedAt) > Date.parse('2026-09-14T00:00:00Z') - staleAfter;

  const trusted = moduleStatus?.sourceAuth === 'trusted';

  const verified =
    moduleStatus?.verification === 'verified' && fresh && trusted;

  if (!verified) {
    return (
      <section className="panel ntn-status-panel">
        <h3>Shanta Econ NTN Status</h3>
        <p>No verified NTN telemetry available.</p>
      </section>
    );
  }

  return (
    <section className="panel ntn-status-panel">
      <h3>Shanta Econ NTN · Network Status</h3>
      <ul>
        <li><strong>Health:</strong> {moduleStatus.health}</li>
        <li><strong>Alerts:</strong> {moduleStatus.alertsCount ?? 'Unknown'}</li>
        <li><strong>Observed:</strong> {observedAt}</li>
      </ul>
    </section>
  );
};
