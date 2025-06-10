import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface APPGCardProps {
  appg: any;
  type: "new" | "removed" | "modified";
  badge: string;
  metadata?: string;
  changes?: Array<{
    field: string;
    from: any;
    to: any;
    period: number;
  }>;
}

export default function APPGCard({ appg, type, badge, metadata, changes }: APPGCardProps) {
  const getCardStyles = () => {
    switch (type) {
      case "new":
        return "border-success bg-success-light";
      case "removed":
        return "border-error bg-error-light";
      case "modified":
        return "border-warning bg-warning-light";
      default:
        return "border-gray-200";
    }
  };

  const getBadgeStyles = () => {
    switch (type) {
      case "new":
        return "bg-success text-white";
      case "removed":
        return "bg-error text-white";
      case "modified":
        return "bg-warning text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getAppgData = () => {
    if (type === "new") {
      return appg.history[appg.firstSeen];
    } else if (type === "removed") {
      return appg.history[appg.lastSeen];
    } else {
      return appg.history[appg.lastSeen] || appg.history.find((h: any) => h);
    }
  };

  const appgData = getAppgData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={`${getCardStyles()} p-4 mb-4`}>
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{appg.name}</h4>
            {metadata && (
              <p className="text-sm text-gray-600 mt-1">{metadata}</p>
            )}
            {appgData && (
              <div className="mt-2 space-y-1">
                {appgData.title && (
                  <p className="text-sm">
                    <span className="font-medium">Title:</span> {appgData.title}
                  </p>
                )}
                {appgData.purpose && (
                  <p className="text-sm">
                    <span className="font-medium">Purpose:</span> {appgData.purpose.substring(0, 150)}{appgData.purpose.length > 150 ? '...' : ''}
                  </p>
                )}
                {appgData.total_benefits !== undefined && appgData.total_benefits > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Total Benefits:</span> {formatCurrency(appgData.total_benefits)}
                  </p>
                )}
                {appgData.chair && (
                  <p className="text-sm">
                    <span className="font-medium">Chair:</span> {appgData.chair}
                  </p>
                )}
                {appgData.members && (
                  <p className="text-sm">
                    <span className="font-medium">Members:</span> {appgData.members}
                  </p>
                )}
                {appgData.status && (
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {appgData.status}
                  </p>
                )}
              </div>
            )}
          </div>
          <Badge className={`${getBadgeStyles()} text-xs px-2 py-1`}>
            {badge}
          </Badge>
        </div>
        
        {changes && changes.length > 0 && (
          <div className="mt-3 space-y-2">
            {changes.map((change, index) => (
              <Card key={index} className="bg-white border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-900">
                  Period {change.period}: {change.field.replace('_', ' ')} changed
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">From</p>
                    <p className="text-sm text-gray-900">
                      {change.field === 'total_benefits' ? formatCurrency(change.from) : String(change.from)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">To</p>
                    <p className="text-sm text-gray-900">
                      {change.field === 'total_benefits' ? formatCurrency(change.to) : String(change.to)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
