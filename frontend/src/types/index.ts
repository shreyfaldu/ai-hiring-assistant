export type JobPayload = {
  job_title: string;
  experience: string;
  skills: string;
  location: string;
  salary: string;
  job_type: string;
  job_description?: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  parsed_data: {
    skills?: string[];
    experience?: string;
    education?: string;
  } | null;
  score?: {
    match_score: number;
    summary: string;
  };
};
