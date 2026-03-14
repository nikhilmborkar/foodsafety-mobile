export type UIOutcome = 'ALLOW' | 'WARN' | 'BLOCK' | 'INCONCLUSIVE';

export interface Profile {
  Profile_ID: string;
  Profile_Name: string;
  Profile_Type: 'Human' | 'Pet';
  Pet_Species: 'Dog' | 'Cat' | 'N/A';
  Age_Group: 'YoungInfant_0_6m' | 'OlderInfant_7_12m' | 'Baby_0_12m' | 'Toddler_1_3y' | 'Child' | 'Teen' | 'Adult' | 'Senior' | 'Pregnant' | 'Breastfeeding';
  Sensitivity_Level: 'Strict' | 'Normal';
  Allergen_Framework: 'EU14';
  Allergen_Token_Version: 'EU14_v1';
  Allergy_Block_Contains: string;
  Allergy_Block_PAL: string;
  Diet_Preference: string;
  Faith_Ruleset: string;
  Faith_Evaluated: boolean;
}

export interface EvaluationOutput {
  Profile_ID: string;
  Outcome: 'BLOCK' | 'WARN' | 'ALLOW';
  Output_State: string;
  Confidence_Score: number;
  Matched_Rule_IDs?: string[];
  Matched_Signals?: string[];
  Message_Codes?: string[];
  Allergen_Source_Details?: Record<string, string[]>;
}

export interface EvaluateRequest {
  barcode: string;
  profiles: Profile[];
}

export interface EvaluateResponse {
  product_id: string;
  product_name: string;
  scan_log_id?: number | null;
  evaluations: EvaluationOutput[];
  inconclusive_reason?: string;
}
