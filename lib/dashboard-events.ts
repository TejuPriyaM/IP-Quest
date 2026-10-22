export const DASHBOARD_DATA_CHANGED_EVENT = 'ip-quest:dashboard-data-changed';

export function notifyDashboardDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DASHBOARD_DATA_CHANGED_EVENT));
  }
}