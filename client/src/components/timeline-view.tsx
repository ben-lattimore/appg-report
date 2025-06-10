import { PlusCircle, MinusCircle, Edit } from "lucide-react";

interface TimelineEvent {
  type: "new" | "removed" | "modified";
  period: number;
  appg: {
    id: string;
    name: string;
  };
  description: string;
}

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No timeline events detected</p>
    );
  }

  // Group events by period
  const groupedEvents = timeline.reduce((acc, event) => {
    if (!acc[event.period]) {
      acc[event.period] = [];
    }
    acc[event.period].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "new":
        return <PlusCircle className="text-success text-sm" />;
      case "removed":
        return <MinusCircle className="text-error text-sm" />;
      case "modified":
        return <Edit className="text-warning text-sm" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {Object.keys(groupedEvents)
        .sort((a, b) => Number(a) - Number(b))
        .map((period) => (
          <div key={period} className="mb-6">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                {period}
              </span>
              Period {period}
            </h5>
            <div className="ml-11 space-y-2">
              {groupedEvents[Number(period)].map((event, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getEventIcon(event.type)}
                  <p className="text-sm text-gray-700">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
