import { readFileSync } from 'fs';
import { join } from 'path';
import type { APPGFile } from '@shared/schema';

// Load the provided JSON files
const loadAppgFile = (filename: string): APPGFile => {
  try {
    // For Vercel deployment, attached_assets is copied to dist/attached_assets
    const basePath = process.env.VERCEL 
      ? join(__dirname, 'attached_assets')
      : join(process.cwd(), 'attached_assets');
    const filePath = join(basePath, filename);
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Transform the data to match our schema
    const appgData = data.appg_groups.map((group: any) => ({
      id: group.name,
      name: group.name,
      title: group.title,
      purpose: group.purpose,
      total_benefits: group.total_benefits,
      benefits_in_kind: group.benefits_in_kind,
      benefits_details: group.benefits_details
    }));

    return {
      filename: filename,
      publication_date: data.publication_date,
      data: appgData
    };
  } catch (error) {
    console.error(`Error loading file ${filename}:`, error);
    console.error(`Attempted path: ${basePath}`);
    console.error(`Full file path: ${filePath}`);
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`__dirname: ${__dirname}`);
    throw new Error(`Failed to load ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const realAppgFiles: APPGFile[] = [
  loadAppgFile('register-200520_appg_data_1749144486704.json'),
  loadAppgFile('register-210602_appg_data_1749144486704.json'),
  loadAppgFile('register-220504_appg_data_1749144486704.json'),
  loadAppgFile('register-230517_appg_data_1749144486704.json'),
  loadAppgFile('register-240530_appg_data_1749144486704.json'),
  loadAppgFile('register-250507_appg_data_1749144486704.json'),
];