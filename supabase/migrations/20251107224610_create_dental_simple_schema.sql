/*
  # DentalSimple Database Schema

  1. New Tables
    - `clinicas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nombre` (text)
      - `created_at` (timestamptz)
    
    - `pacientes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nombre` (text)
      - `telefono` (text)
      - `email` (text, nullable)
      - `fecha_nacimiento` (date, nullable)
      - `direccion` (text, nullable)
      - `alergias` (text, nullable)
      - `created_at` (timestamptz)
    
    - `visitas`
      - `id` (uuid, primary key)
      - `paciente_id` (uuid, references pacientes)
      - `user_id` (uuid, references auth.users)
      - `fecha` (date)
      - `tratamiento` (text)
      - `observaciones` (text, nullable)
      - `costo` (numeric, nullable)
      - `created_at` (timestamptz)
    
    - `citas`
      - `id` (uuid, primary key)
      - `paciente_id` (uuid, references pacientes)
      - `user_id` (uuid, references auth.users)
      - `fecha` (date)
      - `hora` (time)
      - `motivo` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

CREATE TABLE IF NOT EXISTS clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nombre text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinic"
  ON clinicas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clinic"
  ON clinicas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clinic"
  ON clinicas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nombre text NOT NULL,
  telefono text NOT NULL,
  email text,
  fecha_nacimiento date,
  direccion text,
  alergias text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patients"
  ON pacientes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients"
  ON pacientes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients"
  ON pacientes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients"
  ON pacientes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  fecha date NOT NULL,
  tratamiento text NOT NULL,
  observaciones text,
  costo numeric(10,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visits"
  ON visitas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits"
  ON visitas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits"
  ON visitas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits"
  ON visitas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  fecha date NOT NULL,
  hora time NOT NULL,
  motivo text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON citas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON citas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON citas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON citas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_visitas_paciente_id ON visitas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_user_id ON visitas(user_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_user_id ON citas(user_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);