CREATE TABLE public.patient_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Demographics
  full_name TEXT,
  date_of_birth DATE,
  biological_sex TEXT,
  ethnicity TEXT,
  -- Goals & concerns
  primary_goals TEXT[],
  areas_of_concern TEXT[],
  -- Medical
  current_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  past_surgeries TEXT,
  family_history TEXT,
  -- Lifestyle
  diet_pattern TEXT,
  exercise_frequency TEXT,
  sleep_hours NUMERIC,
  stress_level INTEGER,
  smoking_status TEXT,
  alcohol_use TEXT,
  -- Genomics
  prior_genetic_tests TEXT,
  known_variants TEXT,
  -- Free-form
  additional_notes TEXT,
  -- Consent
  consent_research BOOLEAN NOT NULL DEFAULT false,
  consent_data_sharing BOOLEAN NOT NULL DEFAULT false,
  -- Status
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own intake"
  ON public.patient_intake FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Patients insert own intake"
  ON public.patient_intake FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients update own intake"
  ON public.patient_intake FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_patient_intake_updated_at
  BEFORE UPDATE ON public.patient_intake
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();