import type { APPG, APPGFile, ComparisonResult } from "@shared/schema";

export function compareAppgData(files: APPGFile[]): ComparisonResult {
  if (files.length < 2) {
    throw new Error('At least 2 JSON files are required for comparison');
  }

  const allAppgs = new Map();
  const timelineEvents: any[] = [];

  // Process each time period
  files.forEach((period, index) => {
    if (Array.isArray(period.data)) {
      period.data.forEach(appg => {
        const id = appg.id || appg.name;
        if (!allAppgs.has(id)) {
          allAppgs.set(id, {
            id: id,
            name: appg.name,
            history: [],
            firstSeen: index,
            lastSeen: index
          });
        }
        
        const appgRecord = allAppgs.get(id);
        appgRecord.history[index] = appg;
        appgRecord.lastSeen = index;
      });
    }
  });

  // Analyze changes
  const newAppgs: any[] = [];
  const removedAppgs: any[] = [];
  const modifiedAppgs: any[] = [];

  allAppgs.forEach((appg, id) => {
    // Check if new (first appears after period 0)
    if (appg.firstSeen > 0) {
      newAppgs.push({
        ...appg,
        appearedIn: `Period ${appg.firstSeen + 1}`
      });
      
      timelineEvents.push({
        type: 'new',
        period: appg.firstSeen + 1,
        appg: appg,
        description: `${appg.name} was created`
      });
    }

    // Check if removed (last seen before final period)
    if (appg.lastSeen < files.length - 1) {
      removedAppgs.push({
        ...appg,
        lastSeenIn: `Period ${appg.lastSeen + 1}`
      });
      
      timelineEvents.push({
        type: 'removed',
        period: appg.lastSeen + 1,
        appg: appg,
        description: `${appg.name} was discontinued`
      });
    }

    // Check for modifications
    const changes: any[] = [];
    for (let i = 1; i < appg.history.length; i++) {
      if (appg.history[i] && appg.history[i-1]) {
        const current = appg.history[i];
        const previous = appg.history[i-1];
        
        Object.keys(current).forEach(key => {
          if (key !== 'id' && current[key] !== previous[key]) {
            changes.push({
              field: key,
              from: previous[key],
              to: current[key],
              period: i + 1
            });
          }
        });
      }
    }

    if (changes.length > 0) {
      modifiedAppgs.push({
        ...appg,
        changes: changes
      });
      
      changes.forEach(change => {
        timelineEvents.push({
          type: 'modified',
          period: change.period,
          appg: appg,
          description: `${appg.name}: ${change.field} changed from "${change.from}" to "${change.to}"`
        });
      });
    }
  });

  // Sort timeline events
  timelineEvents.sort((a, b) => a.period - b.period);

  return {
    newAppgs,
    removedAppgs,
    modifiedAppgs,
    timeline: timelineEvents,
    totalAppgs: allAppgs.size,
    periods: files.length
  };
}
