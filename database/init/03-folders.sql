-- Create folders table for organizing useful files
CREATE TABLE IF NOT EXISTS dossiers_utiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(254) REFERENCES rh(rhid) ON DELETE SET NULL
);

-- Add folder_id to fichiers_utiles table
ALTER TABLE fichiers_utiles ADD COLUMN folder_id INTEGER REFERENCES dossiers_utiles(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_fichiers_utiles_folder_id ON fichiers_utiles(folder_id);

-- Insert some sample folders
INSERT INTO dossiers_utiles (name, description, created_by)
VALUES 
('Documents administratifs', 'Documents administratifs importants pour les stagiaires', (SELECT rhid FROM rh LIMIT 1)),
('Modèles de rapports', 'Templates et exemples pour les rapports de stage', (SELECT rhid FROM rh LIMIT 1)),
('Règlements', 'Règlements et chartes à respecter', (SELECT rhid FROM rh LIMIT 1));

-- Update existing files to be in appropriate folders
UPDATE fichiers_utiles SET folder_id = (SELECT id FROM dossiers_utiles WHERE name = 'Modèles de rapports') WHERE title LIKE '%rapport%';
UPDATE fichiers_utiles SET folder_id = (SELECT id FROM dossiers_utiles WHERE name = 'Règlements') WHERE title LIKE '%règlement%' OR title LIKE '%charte%';