-- ========================================================
-- SurgLog Complete Database Schema & Migration SQL
-- Run this in the Supabase SQL Editor
-- ========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Procedure Targets Table
CREATE TABLE IF NOT EXISTS public.targets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  required_count int NOT NULL DEFAULT 10,
  UNIQUE(user_id, category)
);

-- 3. Cases Table with Approval Status & Admin Comments
CREATE TABLE IF NOT EXISTS public.cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  procedure_name text NOT NULL,
  category text NOT NULL,
  role text NOT NULL CHECK (role IN ('Observed', 'Assisted', 'Performed')),
  supervisor_name text NOT NULL,
  hospital_ward text NOT NULL,
  complexity text DEFAULT 'Medium',
  patient_age int DEFAULT 0,
  patient_gender text DEFAULT 'Female',
  notes text,
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'needs_review')),
  admin_comment text,
  created_at timestamptz DEFAULT now()
);

-- Migrations (if tables already existed)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'needs_review'));
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS admin_comment text;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Helper Security Definer Function to Check if auth user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- RLS Policies for targets
DROP POLICY IF EXISTS "Users can manage own targets" ON public.targets;
CREATE POLICY "Users can manage own targets" ON public.targets FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- RLS Policies for cases
DROP POLICY IF EXISTS "Users can view own cases" ON public.cases;
CREATE POLICY "Users can view own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;
CREATE POLICY "Users can insert own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;
CREATE POLICY "Users can delete own cases" ON public.cases FOR DELETE USING (auth.uid() = user_id);

-- Auto-Trigger for New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Surgical Resident'),
    false
  );

  INSERT INTO public.targets (user_id, category, required_count) VALUES
    (NEW.id, 'General Surgery', 20),
    (NEW.id, 'Laparoscopic Surgery', 15),
    (NEW.id, 'Trauma & Emergency', 10),
    (NEW.id, 'Vascular Surgery', 10),
    (NEW.id, 'Pediatric Surgery', 10),
    (NEW.id, 'Surgical Oncology', 10),
    (NEW.id, 'Endocrine Surgery', 8),
    (NEW.id, 'Colorectal Surgery', 10)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- HOW TO PROMOTE A USER TO ADMIN:
-- Run this in Supabase SQL editor replacing the email or UUID:
-- 
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
-- ========================================================
