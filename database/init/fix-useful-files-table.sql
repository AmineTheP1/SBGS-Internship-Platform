-- Fix useful_files table structure
-- This script ensures the correct table structure exists

-- Drop the old table if it exists with wrong structure
DROP TABLE IF EXISTS useful_files CASCADE;

-- Create the correct fichiers_utiles table
CREATE TABLE IF NOT EXISTS fichiers_utiles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(254) REFERENCES rh(rhid) ON DELETE SET NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_fichiers_utiles_uploaded_at ON fichiers_utiles(uploaded_at);

-- Insert sample data if table is empty
INSERT INTO fichiers_utiles (title, description, filename, file_path, file_type, uploaded_by)
SELECT 
  'Modèle de rapport final', 
  'Template à utiliser pour le rapport final de stage', 
  'rapport_final_template.docx', 
  '/uploads/fichiers_utiles/sample_rapport_final_template.docx', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  (SELECT rhid FROM rh LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM fichiers_utiles LIMIT 1);

INSERT INTO fichiers_utiles (title, description, filename, file_path, file_type, uploaded_by)
SELECT 
  'Charte du stagiaire', 
  'Document détaillant les droits et obligations des stagiaires', 
  'charte_stagiaire.pdf', 
  '/uploads/fichiers_utiles/sample_charte_stagiaire.pdf', 
  'application/pdf', 
  (SELECT rhid FROM rh LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM fichiers_utiles WHERE title = 'Charte du stagiaire');

INSERT INTO fichiers_utiles (title, description, filename, file_path, file_type, uploaded_by)
SELECT 
  'Règlement intérieur', 
  'Extrait du règlement intérieur applicable aux stagiaires', 
  'reglement_interieur_stagiaires.pdf', 
  '/uploads/fichiers_utiles/sample_reglement_interieur.pdf', 
  'application/pdf', 
  (SELECT rhid FROM rh LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM fichiers_utiles WHERE title = 'Règlement intérieur');

INSERT INTO fichiers_utiles (title, description, filename, file_path, file_type, uploaded_by)
SELECT 
  'Procédure de signature d''attestation', 
  'Guide pour la signature des attestations de stage', 
  'procedure_signature_attestation.pdf', 
  '/uploads/fichiers_utiles/sample_procedure_signature.pdf', 
  'application/pdf', 
  (SELECT rhid FROM rh LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM fichiers_utiles WHERE title = 'Procédure de signature d''attestation');
