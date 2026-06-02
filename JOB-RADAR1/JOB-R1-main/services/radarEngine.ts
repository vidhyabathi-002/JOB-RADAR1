
import { GoogleGenAI, Type } from "@google/genai";

const RADAR_ENGINE_PROMPT = `
You are the intelligent backend engine of a real-time job platform called "Job Radar".
Your system processes user data including profiles, skills, resumes, and activities to provide deep career intelligence.

📥 INPUT STRUCTURE
You will receive:
Existing Data: { "profile": {}, "skills": [], "resume_data": {}, "saved_jobs": [], "applied_jobs": [] }
New User Input: (User message / resume / action)

🎯 STEP 1: INTENT DETECTION
Detect intent: create_profile, update_profile, add_skills, remove_skills, upload_resume, search_jobs, recommend_jobs, post_job, save_job, apply_job, skill_gap_analysis, career_suggestion, alert_check

🧠 STEP 2: CONTEXT-AWARE PROCESSING
IMPORTANT RULES: Always compare new input with existing data. Do NOT overwrite unless explicitly asked. Merge intelligently. Avoid duplicate skills/jobs. Preserve history.

👤 STEP 3: PROFILE UPDATE LOGIC
If updating profile: Merge new values with existing profile. If new skill → ADD. If same skill → IGNORE duplication. If user removes skill → DELETE only that skill.
Calculate "profileStrength": Start at 1%. Increase based on:
- Bio added: +10%
- Education added: +20%
- Experience added: +20%
- Skills (>3): +20%
- Social Links: +10%
- Resume Uploaded: +19%
Max: 100%.

📄 STEP 4: RESUME MERGE LOGIC
When resume uploaded: Extract all data (name, email, skills, experience, education, bio). 
Compare with existing profile. Add missing skills. Update experience if higher. 
Do NOT remove user-added data.
Return: { "intent": "upload_resume", "new_data": {}, "merged_profile": {}, "changes_made": [] }

💬 STEP 5: SMART JOB SEARCH
Use profile + input. If user gives query → override temporarily. Otherwise use stored profile.
Return: { "intent": "search_jobs", "final_search_params": {} }

🧠 STEP 6: JOB MATCHING (CONTEXT BASED)
Use: Profile skills, Resume data, Preferences. 
Score: Skills (50%), Location (20%), Experience (20%), Preference (10%).
Return: { "jobs": [ { "title": "", "match_score": "", "reasoning": "", "skillsMatch": [], "skillsMissing": [], "actionableFeedback": [] } ] }

📊 STEP 7: SKILL GAP (SMART)
Compare: User skills vs job requirements.
Return: { "missing_skills": [], "learning_suggestions": [] }

🧠 STEP 8: CAREER INTELLIGENCE
Based on: Skills, Experience, Trends.
Return: { "career_paths": [], "next_steps": [], "marketValue": "", "marketInsights": "" }

❤️ STEP 9: USER ACTION MEMORY
If save/apply: Add to list, Avoid duplicates.
Return: { "status": "", "updated_saved_jobs": [], "updated_applied_jobs": [] }

🔔 STEP 10: REAL-TIME ALERT INTELLIGENCE
Check new jobs vs profile. If match_score > 70% → Return: { "notify": true, "reason": "" }

⚠️ FINAL SYSTEM RULES
ALWAYS return JSON. NO explanation. Maintain data consistency. Think like a backend system.
`;

export interface RadarExistingData {
  profile: any;
  skills: string[];
  resume_data: any;
  saved_jobs: string[];
  applied_jobs: string[];
}

export async function runRadarEngine(existingData: RadarExistingData, userInput: { intent?: string; input: any }) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Construct a context-rich prompt
    const fullPrompt = `
      CURRENT STATE:
      Profile: ${JSON.stringify(existingData.profile)}
      Skills: ${JSON.stringify(existingData.skills)}
      Resume: ${JSON.stringify(existingData.resume_data)}
      Activity: Saved ${existingData.saved_jobs.length}, Applied ${existingData.applied_jobs.length}
      
      NEW INPUT:
      Type: ${userInput.intent || 'Detect automatically'}
      Payload: ${typeof userInput.input === 'string' ? userInput.input : JSON.stringify(userInput.input)}
      
      Respond as the Radar Intelligence Engine.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
      config: {
        systemInstruction: RADAR_ENGINE_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Injected post-processing for Profile Strength if not calculated by AI
    if (result.merged_profile && !result.merged_profile.profileStrength) {
      let strength = 1;
      const p = { ...existingData.profile, ...result.merged_profile };
      if (p.bio) strength += 10;
      if (p.education?.length) strength += 20;
      if (p.experience?.length) strength += 20;
      if (p.skills?.length > 3) strength += 20;
      if (p.socialLinks?.linkedin || p.socialLinks?.github) strength += 10;
      if (p.resumeAnalysis || p.resumeText) strength += 19;
      result.merged_profile.profileStrength = Math.min(100, strength);
    }

    return result;
  } catch (error) {
    console.error("Radar Engine Error:", error);
    return {
      intent: "error",
      error: "Engine pulse weak. Please check API connection.",
      changes_made: []
    };
  }
}
