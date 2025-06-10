import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MinusCircle, Edit, Clock } from "lucide-react";
import APPGCard from "./appg-card";
import TimelineView from "./timeline-view";
import type { ComparisonResult } from "@shared/schema";

interface ComparisonResultsProps {
  data: ComparisonResult;
}

export default function ComparisonResults({ data }: ComparisonResultsProps) {
  return (
    <div className="space-y-8">
      {/* New APPGs */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <PlusCircle className="text-success mr-2" />
            New APPGs
            <Badge className="ml-2 bg-success text-white">{data.newAppgs.length}</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">APPGs that appeared in later time periods</p>
        </CardHeader>
        <CardContent className="p-6">
          {data.newAppgs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No new APPGs detected</p>
          ) : (
            <div className="space-y-4">
              {data.newAppgs.map((appg) => (
                <APPGCard 
                  key={appg.id} 
                  appg={appg} 
                  type="new" 
                  badge="NEW"
                  metadata={`First appeared in: ${appg.appearedIn}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Removed APPGs */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <MinusCircle className="text-error mr-2" />
            Removed APPGs
            <Badge className="ml-2 bg-error text-white">{data.removedAppgs.length}</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">APPGs that disappeared from later time periods</p>
        </CardHeader>
        <CardContent className="p-6">
          {data.removedAppgs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No removed APPGs detected</p>
          ) : (
            <div className="space-y-4">
              {data.removedAppgs.map((appg) => (
                <APPGCard 
                  key={appg.id} 
                  appg={appg} 
                  type="removed" 
                  badge="REMOVED"
                  metadata={`Last seen in: ${appg.lastSeenIn}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modified APPGs */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Edit className="text-warning mr-2" />
            Modified APPGs
            <Badge className="ml-2 bg-warning text-white">{data.modifiedAppgs.length}</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">APPGs with changes between time periods</p>
        </CardHeader>
        <CardContent className="p-6">
          {data.modifiedAppgs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No modified APPGs detected</p>
          ) : (
            <div className="space-y-4">
              {data.modifiedAppgs.map((appg) => (
                <APPGCard 
                  key={appg.id} 
                  appg={appg} 
                  type="modified" 
                  badge="MODIFIED"
                  changes={appg.changes}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Clock className="text-primary mr-2" />
            Timeline Overview
          </CardTitle>
          <p className="text-sm text-gray-600">Chronological view of all changes</p>
        </CardHeader>
        <CardContent className="p-6">
          <TimelineView timeline={data.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
