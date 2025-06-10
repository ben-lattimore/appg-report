import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Gift, Building2, TrendingUp, BarChart3, ChevronDown, ChevronUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { ComparisonResult } from "@shared/schema";

export default function BenefitsInKind() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedAppgLists, setExpandedAppgLists] = useState<Set<string>>(new Set());
  const [expandedAppgByFunding, setExpandedAppgByFunding] = useState<Set<string>>(new Set());
  const [appgDisplayCounts, setAppgDisplayCounts] = useState<Map<string, number>>(new Map());
  const [funderDisplayCounts, setFunderDisplayCounts] = useState<Map<string, number>>(new Map());
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  
  const { 
    data: benefitsData, 
    isLoading, 
    error 
  } = useQuery<any[]>({
    queryKey: ['/api/benefits-analysis'],
  });

  const toggleExpanded = (year: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedCards(newExpanded);
  };

  const toggleAppgListExpanded = (funderId: string) => {
    const newExpanded = new Set(expandedAppgLists);
    if (newExpanded.has(funderId)) {
      newExpanded.delete(funderId);
    } else {
      newExpanded.add(funderId);
    }
    setExpandedAppgLists(newExpanded);
  };

  const toggleAppgByFundingExpanded = (year: string) => {
    const newExpanded = new Set(expandedAppgByFunding);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedAppgByFunding(newExpanded);
  };

  const loadMoreAppgs = (year: string) => {
    const newCounts = new Map(appgDisplayCounts);
    const currentCount = newCounts.get(year) || 10;
    newCounts.set(year, currentCount + 10);
    setAppgDisplayCounts(newCounts);
  };

  const loadMoreFunders = (year: string) => {
    const newCounts = new Map(funderDisplayCounts);
    const currentCount = newCounts.get(year) || 10;
    newCounts.set(year, currentCount + 10);
    setFunderDisplayCounts(newCounts);
  };

  const openThemeModal = (theme: any, year: string) => {
    setSelectedTheme({ ...theme, year });
    setIsThemeModalOpen(true);
  };

  const closeThemeModal = () => {
    setIsThemeModalOpen(false);
    setSelectedTheme(null);
  };



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

  const capitalizeWords = (text: string) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Prepare chart data
  const chartData = benefitsData?.map(yearData => ({
    year: yearData.year,
    totalBenefitsValue: roundToNearest1500(yearData.totalBenefitsValue),
    groupsWithBenefits: yearData.groupsWithBenefits,
    topFunderAmount: yearData.topFunders.length > 0 ? roundToNearest1500(yearData.topFunders[0].totalAmount) : 0,
    topFunderName: yearData.topFunders.length > 0 ? yearData.topFunders[0].name : 'None'
  })) || [];

  // Get all unique funders across years for funder comparison chart
  const allFunders = new Map();
  benefitsData?.forEach(yearData => {
    yearData.topFunders.forEach((funder: any) => {
      if (!allFunders.has(funder.name)) {
        allFunders.set(funder.name, {
          name: funder.name,
          yearlyAmounts: {}
        });
      }
      allFunders.get(funder.name).yearlyAmounts[yearData.year] = roundToNearest1500(funder.totalAmount);
    });
  });

  // Get top 10 most active funders across all years
  const topFundersOverall = Array.from(allFunders.values())
    .map(funder => ({
      ...funder,
      totalAcrossYears: Object.values(funder.yearlyAmounts).reduce((sum: number, amount: any) => sum + amount, 0),
      activeYears: Object.keys(funder.yearlyAmounts).length
    }))
    .sort((a, b) => b.totalAcrossYears - a.totalAcrossYears)
    .slice(0, 10);

  // Prepare data for funder comparison chart
  const funderComparisonData = benefitsData?.map(yearData => {
    const dataPoint: any = { year: yearData.year };
    topFundersOverall.forEach(funder => {
      dataPoint[funder.name] = funder.yearlyAmounts[yearData.year] || 0;
    });
    return dataPoint;
  }) || [];

  // Prepare APPG data by funding amount and funder count
  const appgDataByYear = benefitsData?.map(yearData => {
    // Use backend's topByFunding if available, otherwise fall back to processing from topFunders
    if (yearData.topByFunding && yearData.topByFunding.length > 0) {
      // Backend provides complete topByFunding data - use it directly
      const topByFunding = yearData.topByFunding.map((appg: any) => ({
        name: appg.name,
        title: appg.title || appg.name,
        totalFunding: appg.totalBenefits || 0, // Map backend field to frontend field
        funderCount: 1 // Simplified for now
      }));

      return {
        year: yearData.year,
        publication_date: yearData.publication_date,
        topByFunding,
        topByFunderCount: topByFunding.slice(0, 10) // Use same data for both initially
      };
    }

    // Fallback: Calculate funding amount and funder count for each APPG from topFunders
    const appgStats = new Map();
    
    yearData.topFunders.forEach((funder: any) => {
      funder.appgs?.forEach((appg: any) => {
        const appgName = appg.name;
        if (!appgStats.has(appgName)) {
          appgStats.set(appgName, {
            name: appgName,
            title: appg.title || appgName,
            totalFunding: 0,
            funderCount: new Set()
          });
        }
        const stats = appgStats.get(appgName);
        stats.totalFunding += roundToNearest1500(appg.amount || 0);
        stats.funderCount.add(funder.name);
      });
    });

    // Convert to arrays and get top 10 by funding amount and funder count
    const appgArray = Array.from(appgStats.values()).map(stats => ({
      ...stats,
      funderCount: stats.funderCount.size
    }));

    const topByFunding = appgArray
      .sort((a, b) => b.totalFunding - a.totalFunding)
      .slice(0, 10);

    const topByFunderCount = appgArray
      .sort((a, b) => b.funderCount - a.funderCount)
      .slice(0, 10);

    return {
      year: yearData.year,
      publication_date: yearData.publication_date,
      topByFunding,
      topByFunderCount
    };
  }) || [];



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">Loading benefits data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-red-600 text-center">
                Error loading data. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Gift className="mr-3 text-primary" />
                Benefits in Kind Analysis
              </h1>
              <p className="mt-2 text-gray-600">
                Detailed analysis of funding sources and APPG support across all years
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-4 py-8">
        {benefitsData && (
          <div className="space-y-8">
            {/* Top 10 APPGs by Funding Amount */}
            {appgDataByYear.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="mr-3 text-indigo-600" />
                  Top 10 APPGs by Funding Amount per Year
                </h2>
                <div className="grid grid-cols-1 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-2 gap-6">
                  {appgDataByYear.map((yearData) => (
                    <Card key={yearData.year} className="shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                          <Building2 className="mr-2 text-indigo-600" size={20} />
                          {yearData.year}
                        </CardTitle>
                        <div className="text-xs text-gray-500 mt-1">
                          Report Published: {yearData.publication_date}
                        </div>
                        <div className="text-xs text-gray-600">
                          Top APPGs by funding amount
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {(() => {
                            const isExpanded = expandedAppgByFunding.has(yearData.year);
                            const displayCount = appgDisplayCounts.get(yearData.year) || 10;
                            const appgsToShow = isExpanded ? yearData.topByFunding : yearData.topByFunding.slice(0, displayCount);
                            

                            

                            
                            return (
                              <>
                                {appgsToShow.map((appg, index) => (
                                  <div key={`${yearData.year}-${appg.name}`} className="border rounded p-2 bg-gray-50">
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm text-gray-900 truncate" title={capitalizeWords(appg.title || appg.name)}>
                                        #{index + 1}. {capitalizeWords(appg.name)}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs text-indigo-700 bg-indigo-100">
                                          {formatCurrency(appg.totalFunding)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Load More functionality for all years */}
                                <>
                                  {displayCount < yearData.topByFunding.length && !isExpanded && (
                                    <button
                                      onClick={() => loadMoreAppgs(yearData.year)}
                                      className="w-full text-xs text-green-600 hover:text-green-800 text-center py-2 flex items-center justify-center space-x-1 bg-green-50 rounded"
                                    >
                                      <ChevronDown size={12} />
                                      <span>Load next 10 APPGs ({yearData.topByFunding.length - displayCount} remaining)</span>
                                    </button>
                                  )}
                                  {displayCount >= yearData.topByFunding.length && (
                                    <button
                                      onClick={() => setAppgDisplayCounts(new Map(appgDisplayCounts.set(yearData.year, 10)))}
                                      className="w-full text-xs text-blue-600 hover:text-blue-800 text-center py-2 flex items-center justify-center space-x-1"
                                    >
                                      <ChevronUp size={12} />
                                      <span>Show less</span>
                                    </button>
                                  )}
                                </>
                              </>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Themes by Year Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 text-purple-600" />
                Top Political Themes by Funding Per Year
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-2 gap-6">
                {benefitsData.map((yearData, index) => (
                  <Card key={yearData.year} className="shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                        <Users className="mr-2 text-purple-600" size={20} />
                        {yearData.year}
                      </CardTitle>
                      <div className="text-xs text-gray-500 mt-1">
                        Report Published: {yearData.publication_date}
                      </div>
                      <div className="text-xs text-gray-600">
                        APPGs categorized by political themes
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {yearData.topThemes && yearData.topThemes.length > 0 ? (
                        <div className="space-y-2">
                          {yearData.topThemes.slice(0, 10).map((theme: any, themeIndex: number) => (
                            <div 
                              key={theme.theme} 
                              className="border rounded p-2 bg-gray-50 cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-colors"
                              onClick={() => openThemeModal(theme, yearData.year)}
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-sm text-gray-900 truncate" title={theme.theme}>
                                  #{themeIndex + 1}. {theme.theme}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary" className="text-xs text-purple-700 bg-purple-100">
                                    {formatCurrency(theme.totalFunding)}
                                  </Badge>
                                  <span className="text-xs text-gray-600">
                                    {theme.appgCount} APPGs
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No themed data found</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Funders by Year Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="mr-3 text-blue-600" />
                Top 10 Funders of APPGs (and What They Fund) Per Year
              </h2>
              <div className="grid grid-cols-1 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-2 gap-6">
              {benefitsData.map((yearData, index) => (
                <Card key={yearData.year} className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <Building2 className="mr-2 text-blue-600" size={20} />
                    {yearData.year}
                  </CardTitle>
                  <div className="text-xs text-gray-500 mt-1">
                    Report Published: {yearData.publication_date}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{yearData.totalGroups} total groups</div>
                    <div>{formatCurrency(yearData.totalBenefitsValue)} benefits</div>
                    <div>{yearData.groupsWithBenefits} with benefits</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {yearData.topFunders.length > 0 ? (
                    <div className="space-y-2">
                      {(() => {
                        const funderDisplayCount = funderDisplayCounts.get(yearData.year) || 10;
                        const fundersToShow = yearData.topFunders.slice(0, funderDisplayCount);
                        return (
                          <>
                            {fundersToShow.map((funder: any, funderIndex: number) => (
                              <div key={funder.name} className="border rounded p-2 bg-gray-50">
                          <div className="space-y-1">
                            <div className="font-medium text-sm text-gray-900 truncate" title={funder.name}>
                              #{funderIndex + 1}. {funder.name}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                                {formatCurrency(funder.totalAmount)}
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {funder.appgsSupported} APPGs
                              </span>
                            </div>
                          </div>
                          
                          {funder.appgs && funder.appgs.length > 0 && (
                            <div className="mt-2">
                              <div className="space-y-1">
                                {(() => {
                                  const funderId = `${yearData.year}-${funder.name}`;
                                  const isAppgListExpanded = expandedAppgLists.has(funderId);
                                  const appgsToShow = isAppgListExpanded ? funder.appgs : funder.appgs.slice(0, 3);
                                  
                                  return (
                                    <>
                                      {appgsToShow.map((appg: any, appgIndex: number) => (
                                        <div key={appgIndex} className="text-xs bg-white rounded px-2 py-1 border">
                                          <div className="flex items-center gap-1 mb-1">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1 rounded">APPG</span>
                                          </div>
                                          <div className="font-medium text-gray-800 truncate" title={capitalizeWords(appg.name)}>
                                            {capitalizeWords(appg.name)}
                                          </div>
                                          <div className="text-gray-600">{formatCurrency(appg.amount)}</div>
                                        </div>
                                      ))}
                                      {funder.appgs.length > 3 && (
                                        <button
                                          onClick={() => toggleAppgListExpanded(funderId)}
                                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 flex items-center space-x-1"
                                        >
                                          {isAppgListExpanded ? (
                                            <>
                                              <ChevronUp size={10} />
                                              <span>Show less</span>
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown size={10} />
                                              <span>+{funder.appgs.length - 3} more</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                            ))}
                            {funderDisplayCount < yearData.topFunders.length && (
                              <button
                                onClick={() => loadMoreFunders(yearData.year)}
                                className="w-full text-xs text-green-600 hover:text-green-800 text-center py-2 flex items-center justify-center space-x-1 bg-green-50 rounded"
                              >
                                <ChevronDown size={12} />
                                <span>Load next 10 funders ({yearData.topFunders.length - funderDisplayCount} remaining)</span>
                              </button>
                            )}
                            {funderDisplayCount > 10 && (
                              <button
                                onClick={() => setFunderDisplayCounts(new Map(funderDisplayCounts.set(yearData.year, 10)))}
                                className="w-full text-xs text-blue-600 hover:text-blue-800 text-center py-2 flex items-center justify-center space-x-1"
                              >
                                <ChevronUp size={12} />
                                <span>Show less</span>
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No funders found</p>
                  )}
                </CardContent>
              </Card>
            ))}
              </div>
            </div>

            {/* Charts Section */}
            {chartData.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="mr-3 text-blue-600" />
                    Total Benefits Value by Year
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis 
                          tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), "Total Benefits Value"]}
                          labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Bar dataKey="totalBenefitsValue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Theme Details Modal */}
      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-700">
              {selectedTheme?.theme} - {selectedTheme?.year}
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Total Funding: {selectedTheme && formatCurrency(selectedTheme.totalFunding)} | 
              {selectedTheme?.appgCount} APPGs
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {selectedTheme?.appgs && selectedTheme.appgs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                {selectedTheme.appgs
                  .sort((a: any, b: any) => b.funding - a.funding)
                  .map((appg: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-purple-50 transition-colors">
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-gray-900">
                          #{index + 1}. {capitalizeWords(appg.name)}
                        </div>
                        {appg.title && appg.title !== appg.name && (
                          <div className="text-xs text-gray-600 italic">
                            {capitalizeWords(appg.title)}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs text-purple-700 bg-purple-100">
                            {formatCurrency(appg.funding)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No APPGs found for this theme
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <button
              onClick={closeThemeModal}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}