import { users, type User, type InsertUser, type APPG, type APPGFile, type ComparisonResult } from "@shared/schema";
import { readFileSync } from 'fs';
import { join } from 'path';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  processAppgFiles(files: APPGFile[]): Promise<ComparisonResult>;
  processBenefitsData(files: APPGFile[]): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  private roundToNearest1500(amount: number): number {
    return Math.round(amount / 1500) * 1500;
  }

  private categorizeAppgByTheme(appg: any): string {
    const name = (appg.name || '').toLowerCase();
    const text = name;

    // Business & Economy
    if (text.match(/\b(business|economy|economic|finance|financial|banking|investment|trade|commerce|industry|manufacturing|retail|corporate|entrepreneur|startup|small business|sme|economic development|economic policy|fiscal|monetary|taxation|tax|revenue|employment|jobs|workforce|labour|labor|productivity|competitiveness|innovation|research development|intellectual property|patents|copyright|competition|regulation|market|consumer|supply chain|logistics|procurement|pfi|private finance|public private partnership|maritime|aviation|aerospace|automotive|construction|energy|utilities|telecoms|telecommunications|digital|technology|tech|artificial intelligence|ai|cybersecurity|data|software|hardware|fintech|insurtech|blockchain|cryptocurrency|venture capital|private equity|stock exchange|commodities|derivatives|bonds|securities|pension|retirement|savings|debt|credit|lending|mortgage|insurance|accountancy|audit|consulting)\b/)) {
      return 'Business & Economy';
    }

    // Health & Social Care
    if (text.match(/\b(health|medical|medicine|healthcare|nhs|hospital|doctor|nurse|mental health|psychiatry|psychology|cancer|diabetes|alzheimer|dementia|disability|accessible|accessibility|blind|deaf|autism|adhd|therapy|pharmaceutical|drug|vaccine|pandemic|covid|disease|illness|wellbeing|wellness|baby loss|bladder|bowel|continence|eating disorders|endometriosis|fertility|pregnancy|maternity|infant|child health|multiple sclerosis|stem cell|vaccination|nutrition|malnutrition|obesity|social care|elderly|ageing|care homes|carers|community care|long term care|palliative|hospice|public health|epidemiology|biomedical|clinical|primary care|secondary care|gp|general practice|surgery|emergency|ambulance|paramedic|midwife|physiotherapy|occupational therapy|speech therapy|radiography|pharmacy|dentistry|optometry|veterinary|animal health)\b/)) {
      return 'Health & Social Care';
    }

    // Education & Skills
    if (text.match(/\b(education|educational|school|schools|university|universities|college|colleges|student|students|pupil|pupils|teacher|teachers|teaching|learning|curriculum|examination|exams|qualifications|degree|diploma|certificate|skills|training|apprenticeship|vocational|further education|higher education|primary education|secondary education|early years|nursery|childcare|special educational needs|sen|adult education|continuing education|lifelong learning|literacy|numeracy|english|mathematics|science|history|geography|languages|arts|music|drama|pe|physical education|careers|guidance|counselling|academic|research|scholarship|bursary|student finance|tuition fees|educational technology|e-learning|distance learning|homeschooling|international education|educational exchange|study abroad)\b/)) {
      return 'Education & Skills';
    }

    // International Affairs & Defence
    if (text.match(/\b(international|foreign|diplomatic|diplomacy|defence|defense|military|armed forces|army|navy|air force|marines|security|national security|intelligence|mi5|mi6|gchq|nato|un|united nations|european union|eu|commonwealth|g7|g8|g20|oecd|world bank|imf|wto|peacekeeping|conflict|war|terrorism|counter terrorism|nuclear|weapons|arms|disarmament|sanctions|embassy|consulate|ambassador|visa|immigration|refugee|asylum|humanitarian|aid|development|overseas|africa|asia|europe|america|middle east|china|india|russia|usa|canada|australia|new zealand|france|germany|italy|spain|netherlands|brexit|trade deals|treaties|conventions|human rights|genocide|war crimes|international law|sovereignty|borders|territorial|maritime boundaries)\b/)) {
      return 'International Affairs & Defence';
    }

    // Environment & Climate Change
    if (text.match(/\b(environment|environmental|climate|carbon|emissions|greenhouse|sustainability|sustainable|green|renewable|solar|wind|nuclear|energy|biodiversity|conservation|wildlife|nature|habitat|ecosystem|pollution|air quality|water quality|waste|recycling|circular economy|marine|ocean|sea|river|forest|woodland|agriculture|farming|food|fisheries|flooding|drought|weather|natural disasters|adaptation|mitigation|net zero|decarbonisation|electric vehicles|transport|planning|development|countryside|rural|urban|cities|housing|building|construction|green belt|national parks|protected areas|endangered species|\bengland\b|\bwales\b|\bscotland\b|\bnorthern ireland\b|landscape|heritage|tourism|outdoor|walking|cycling|parks|gardens)\b/)) {
      return 'Environment & Climate Change';
    }

    // Transport & Infrastructure
    if (text.match(/\b(transport|transportation|infrastructure|roads|railways|rail|trains|buses|aviation|airports|ports|shipping|maritime|cycling|walking|electric vehicles|autonomous vehicles|public transport|freight|logistics|hs2|crossrail|motorways|a roads|bridges|tunnels|stations|parking|traffic|congestion|connectivity|broadband|digital infrastructure|5g|fibre|telecommunications|utilities|water|gas|electricity|nuclear|renewable energy|smart grid|electric charging|fuel|petrol|diesel|hydrogen|planning|development|construction|housing|building|affordable housing|social housing|homelessness|rough sleeping|regeneration|levelling up|devolution|local government|councils|mayors|city regions)\b/)) {
      return 'Transport & Infrastructure';
    }

    // Law, Justice & Home Affairs
    if (text.match(/\b(law|legal|justice|courts|judiciary|judges|magistrates|barristers|solicitors|legal aid|human rights|civil rights|constitutional|parliament|democracy|voting|elections|electoral|political|government|governance|public administration|civil service|transparency|accountability|ombudsman|regulation|regulators|compliance|enforcement|police|policing|crime|criminal|prosecution|cps|prison|probation|sentencing|victims|witness|domestic violence|violence against women|sexual violence|hate crime|terrorism|extremism|radicalisation|immigration|border|citizenship|nationality|equality|discrimination|race|gender|lgbtq|disability rights|data protection|privacy|freedom of information|foi|surveillance|censorship|media|press|broadcasting|journalism|fake news|disinformation)\b/)) {
      return 'Law, Justice & Home Affairs';
    }

    // Science, Technology & Innovation
    if (text.match(/\b(science|scientific|research|innovation|technology|digital|cyber|artificial intelligence|ai|machine learning|robotics|automation|biotechnology|genetics|genomics|stem cells|pharmaceutical|medical devices|space|aerospace|quantum|nanotechnology|materials|engineering|computing|software|hardware|internet|online|data|analytics|algorithms|blockchain|cryptocurrency|fintech|cleantech|agritech|medtech|edtech|virtual reality|vr|augmented reality|ar|5g|broadband|connectivity|digital divide|digital skills|coding|programming|patents|intellectual property|startups|venture capital|r&d|ukri|research councils|universities|collaboration|knowledge transfer|commercialisation)\b/)) {
      return 'Science, Technology & Innovation';
    }

    // Culture, Media & Sport
    if (text.match(/\b(culture|cultural|arts|heritage|museums|galleries|libraries|archives|creative|creative industries|film|television|tv|radio|music|theatre|dance|literature|poetry|publishing|gaming|esports|sport|sports|football|rugby|cricket|tennis|golf|boxing|athletics|swimming|cycling|rowing|sailing|motorsport|racing|olympics|paralympics|commonwealth games|netball|basketball|baseball|softball|snooker|darts|fitness|recreation|leisure|tourism|hospitality|events|festivals|media|broadcasting|journalism|press|advertising|public relations|communications|languages|welsh|gaelic|scots|regional languages|multiculturalism|diversity|inclusion|community|voluntary sector|charities|social enterprise)\b/)) {
      return 'Culture, Media & Sport';
    }

    // Work & Pensions
    if (text.match(/\b(work|employment|jobs|workforce|labour|labor|trade unions|industrial relations|workplace|occupational|health safety|minimum wage|living wage|zero hours|gig economy|flexible working|remote working|hybrid working|unemployment|job seekers|universal credit|benefits|welfare|social security|pensions|retirement|state pension|workplace pensions|auto enrolment|pension freedoms|older workers|age discrimination|gender pay gap|equal pay|maternity|paternity|parental leave|childcare|skills|training|apprenticeships|adult education|reskilling|upskilling|career|guidance|job centres|work programme|disability employment|supported employment|carers|caring responsibilities|work life balance)\b/)) {
      return 'Work & Pensions';
    }

    // Housing & Communities
    if (text.match(/\b(housing|homes|affordable housing|social housing|housing association|council housing|right to buy|shared ownership|rent|rental|landlord|tenant|leasehold|freehold|building safety|cladding|fire safety|homelessness|rough sleeping|temporary accommodation|housing benefit|housing costs|mortgage|first time buyers|help to buy|planning|development|housebuilding|construction|building regulations|building standards|communities|neighbourhood|local|regeneration|urban|rural|town|city|village|parish|community|voluntary|charities|social enterprise|faith|religious|community cohesion|integration|multiculturalism|diversity|inclusion|community safety|antisocial behaviour|youth|children|families|older people|carers|community centres|libraries|parks|public spaces)\b/)) {
      return 'Housing & Communities';
    }

    // Public Services & Administration
    if (text.match(/\b(public services|civil service|government|administration|whitehall|departments|agencies|quangos|public bodies|local government|councils|mayors|devolution|procurement|outsourcing|public private partnerships|pfi|efficiency|productivity|digital government|digital services|online|data|statistics|evidence|policy|regulation|inspection|audit|performance|accountability|transparency|freedom of information|foi|complaints|ombudsman|public appointments|diversity|inclusion|leadership|management|hr|human resources|recruitment|pay|pensions|consultation|engagement|participation|citizen|user experience|service design|transformation|modernisation)\b/)) {
      return 'Public Services & Administration';
    }

    // Agriculture, Food & Rural Affairs  
    if (text.match(/\b(agriculture|agricultural|farming|farm|farmers|rural|countryside|food|nutrition|diet|obesity|malnutrition|food security|food safety|food standards|organic|pesticides|fertilizers|gm|genetic modification|livestock|cattle|sheep|pigs|poultry|dairy|meat|fishing|fisheries|aquaculture|horticulture|forestry|woodland|trees|crops|arable|cereals|vegetables|fruit|wine|cider|beer|brewing|distilling|supply chain|processing|packaging|retail|restaurants|catering|hospitality|animal welfare|veterinary|plant health|biosecurity|trade|exports|imports|tariffs|subsidies|cap|common agricultural policy|environment|climate|biodiversity|conservation|pollution|water|soil|land use|planning|development)\b/)) {
      return 'Agriculture, Food & Rural Affairs';
    }

    // Default fallback
    return 'Other';
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async processAppgFiles(files: APPGFile[]): Promise<ComparisonResult> {
    // Calculate year-by-year summaries using raw JSON data
    const yearSummaries = files.map((file, index) => {
      const year = this.extractYearFromFilename(file.filename);
      
      // Load raw JSON to get actual totals
      const filePath = join(process.cwd(), 'attached_assets', file.filename);
      const rawData = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      return {
        year,
        filename: file.filename,
        totalGroups: rawData.total_groups,
        totalBenefitsValue: this.roundToNearest1500(rawData.total_benefits_value),
        groupsWithBenefits: rawData.appg_groups.filter((group: any) => group.total_benefits > 0).length,
        period: index + 1
      };
    });

    // Calculate overall changes between first and last year
    const firstYear = yearSummaries[0];
    const lastYear = yearSummaries[yearSummaries.length - 1];
    
    const overallChanges = {
      firstYear: firstYear.year,
      lastYear: lastYear.year,
      groupCountChange: lastYear.totalGroups - firstYear.totalGroups,
      benefitsValueChange: lastYear.totalBenefitsValue - firstYear.totalBenefitsValue,
      benefitsGroupsChange: lastYear.groupsWithBenefits - firstYear.groupsWithBenefits
    };

    return {
      newAppgs: [],
      removedAppgs: [],
      modifiedAppgs: [],
      timeline: [],
      totalAppgs: 0,
      periods: files.length,
      yearSummaries,
      overallChanges
    };
  }

  async processBenefitsData(files: APPGFile[]): Promise<any> {
    const yearlyFunders: any[] = [];

    files.forEach(file => {
      const year = this.extractYearFromFilename(file.filename);
      
      // Load raw JSON to extract funder details
      const filePath = join(process.cwd(), 'attached_assets', file.filename);
      const rawData = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      // Extract funders from benefits_details
      const fundersMap = new Map();
      
      rawData.appg_groups.forEach((group: any) => {
        if (group.benefits_details && group.benefits_details.length > 0) {
          group.benefits_details.forEach((benefit: any) => {
            if (benefit.source) {
              // Extract funder name from source (before "Secretariat")
              const funderMatch = benefit.source.match(/^(.+?)\s+Secretariat/);
              const funderName = funderMatch ? funderMatch[1].trim() : benefit.source.split(' ')[0];
              
              if (!fundersMap.has(funderName)) {
                fundersMap.set(funderName, {
                  totalAmount: 0,
                  appgs: []
                });
              }
              
              const funderData = fundersMap.get(funderName);
              const roundedAmount = this.roundToNearest1500(benefit.calculated_value || 0);
              funderData.totalAmount += roundedAmount;
              funderData.appgs.push({
                name: group.name,
                title: group.title,
                amount: roundedAmount,
                valueRange: benefit.value_range
              });
            }
          });
        }
      });
      
      // Get all funders sorted by total amount (for pagination)
      const topFunders = Array.from(fundersMap.entries())
        .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
        .map(([name, data]) => ({
          name,
          totalAmount: data.totalAmount,
          appgsSupported: data.appgs.length,
          appgs: data.appgs
        }));

      // Get all APPGs sorted by funding amount (for pagination)
      const topByFunding = rawData.appg_groups
        .filter((group: any) => group.total_benefits > 0)
        .map((group: any) => ({
          id: group.name,
          name: group.name,
          title: group.title,
          purpose: group.purpose,
          totalBenefits: this.roundToNearest1500(group.total_benefits),
          benefitsInKind: group.benefits_in_kind,
          benefitsDetails: group.benefits_details
        }))
        .sort((a: any, b: any) => b.totalBenefits - a.totalBenefits);


      // Calculate themes with funding
      const themeStats = new Map();
      rawData.appg_groups.forEach((group: any) => {
        if (group.total_benefits > 0) {
          const theme = this.categorizeAppgByTheme(group);
          if (!themeStats.has(theme)) {
            themeStats.set(theme, {
              theme,
              totalFunding: 0,
              appgCount: 0,
              appgs: []
            });
          }
          const stats = themeStats.get(theme);
          stats.totalFunding += this.roundToNearest1500(group.total_benefits);
          stats.appgCount += 1;
          stats.appgs.push({
            name: group.name,
            title: group.title,
            funding: this.roundToNearest1500(group.total_benefits)
          });
        }
      });

      const topThemes = Array.from(themeStats.values())
        .sort((a, b) => b.totalFunding - a.totalFunding);
        


      yearlyFunders.push({
        year,
        publication_date: file.publication_date,
        totalGroups: rawData.total_groups,
        totalBenefitsValue: this.roundToNearest1500(rawData.total_benefits_value),
        groupsWithBenefits: rawData.appg_groups.filter((group: any) => group.total_benefits > 0).length,
        topFunders,
        topByFunding,
        topThemes
      });
    });

    return yearlyFunders;
  }

  private extractYearFromFilename(filename: string): string {
    // Extract year from filename like "register-200520_appg_data_1749143059916.json"
    const match = filename.match(/register-(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      return `20${year}`;
    }
    return filename;
  }
}

export const storage = new MemStorage();
