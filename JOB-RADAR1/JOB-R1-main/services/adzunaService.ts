
import { Job, JobCategory } from "../types";

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID || "5749c84f";
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY || "e5dc0eb7db21915f043bc00ad25a27c9";
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1";

export async function fetchAdzunaJobs(query: string, area: string): Promise<Job[]> {
  try {
    const url = `${BASE_URL}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(area)}&content-type=application/json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.results.map((result: any) => ({
      id: result.id,
      title: result.title.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags
      company: result.company.display_name,
      location: {
        lat: result.latitude || 13.0827,
        lng: result.longitude || 80.2707,
        address: result.location.display_name,
        area: result.location.area[result.location.area.length - 1] || area
      },
      salary: result.salary_min ? `₹${result.salary_min.toLocaleString()} - ₹${result.salary_max?.toLocaleString() || 'N/A'}` : "Competitive",
      description: result.description.replace(/<\/?[^>]+(>|$)/g, ""),
      category: result.category.tag === 'it-jobs' ? JobCategory.IT : JobCategory.LOCAL,
      urgent: Math.random() > 0.8, // Adzuna doesn't have an "urgent" flag, so we randomize for UI variety
      status: 'OPEN',
      skills_required: [result.category.label, ...(result.title.split(' ').filter((s: string) => s.length > 3))],
      posted_at: result.created
    }));
  } catch (error) {
    console.error("Adzuna Fetch Error:", error);
    return [];
  }
}
