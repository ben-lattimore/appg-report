import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, MinusCircle, Edit, BarChart3 } from "lucide-react";
import type { ComparisonResult } from "@shared/schema";

interface SummaryStatsProps {
  data: ComparisonResult;
}

export default function SummaryStats({ data }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlusCircle className="text-success text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New APPGs</p>
              <p className="text-2xl font-bold text-success">{data.newAppgs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MinusCircle className="text-error text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Removed APPGs</p>
              <p className="text-2xl font-bold text-error">{data.removedAppgs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Edit className="text-warning text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Modified APPGs</p>
              <p className="text-2xl font-bold text-warning">{data.modifiedAppgs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="text-primary text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total APPGs</p>
              <p className="text-2xl font-bold text-primary">{data.totalAppgs}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
