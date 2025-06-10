import { readFileSync } from 'fs';
import { join } from 'path';
import type { APPGFile } from '@shared/schema';

// Load the provided JSON files
const loadAppgFile = (filename: string): APPGFile => {
  try {
    const filePath = join(process.cwd(), 'attached_assets', filename);
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
    throw new Error(`Failed to load ${filename}`);
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