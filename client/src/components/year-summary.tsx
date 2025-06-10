import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { ComparisonResult } from "@shared/schema";

interface YearSummaryProps {
  data: ComparisonResult;
}

export default function YearSummary({ data }: YearSummaryProps) {
  const roundToNearest1500 = (amount: number) => {
    return Math.round(amount / 1500) * 1500;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatChange = (change: number, isPositive?: boolean) => {
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'text-green-600' : 'text-red-600';
    return <span className={color}>{sign}{change.toLocaleString()}</span>;
  };

  const formatCurrencyChange = (change: number) => {
    const roundedChange = roundToNearest1500(change);
    const sign = roundedChange >= 0 ? '+' : '';
    const color = roundedChange >= 0 ? 'text-green-600' : 'text-red-600';
    return <span className={color}>{sign}{formatCurrency(roundedChange)}</span>;
  };

  // Prepare chart data
  const chartData = data.yearSummaries?.map(year => ({
    year: year.year,
    totalGroups: year.totalGroups,
    totalBenefitsValue: roundToNearest1500(year.totalBenefitsValue),
    groupsWithBenefits: year.groupsWithBenefits
  })) || [];

  return (
    <div className="space-y-8">
      {/* Year-by-year data */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="mr-3 text-primary" />
          📊 Summary Statistics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.yearSummaries?.map((year, index) => (
            <Card key={year.year} className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {year.year} Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="text-blue-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-gray-700">Total Groups</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {year.totalGroups.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="text-green-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-gray-700">Total Benefits Value</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(roundToNearest1500(year.totalBenefitsValue))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <BarChart3 className="text-purple-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-gray-700">Groups with Benefits</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {year.groupsWithBenefits.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Overall Changes */}
      {data.overallChanges && (
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="mr-3 text-primary" />
              Changes ({data.overallChanges.firstYear} → {data.overallChanges.lastYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-gray-600 mr-2" size={24} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Group Count Change</p>
                <p className="text-2xl font-bold">
                  {formatChange(data.overallChanges.groupCountChange)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="text-gray-600 mr-2" size={24} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Benefits Value Change</p>
                <p className="text-xl font-bold">
                  {formatCurrencyChange(data.overallChanges.benefitsValueChange)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="text-gray-600 mr-2" size={24} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Groups with Benefits Change</p>
                <p className="text-2xl font-bold">
                  {formatChange(data.overallChanges.benefitsGroupsChange)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {chartData.length > 0 && (
        <div className="space-y-8">
          {/* Total Groups Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 text-blue-600" />
                Total Groups by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value?.toLocaleString(), "Total Groups"]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Bar dataKey="totalGroups" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Total Benefits Value Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <DollarSign className="mr-3 text-green-600" />
                Total Benefits Value by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), "Total Benefits Value"]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalBenefitsValue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}