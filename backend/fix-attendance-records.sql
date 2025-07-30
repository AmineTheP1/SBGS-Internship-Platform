-- Fix attendance records that don't have proper NULL values for confirme_par_superviseur
UPDATE presence 
SET confirme_par_superviseur = NULL 
WHERE confirme_par_superviseur IS NOT TRUE AND confirme_par_superviseur IS NOT FALSE;

-- Also ensure date_confirmation is NULL for unconfirmed records
UPDATE presence 
SET date_confirmation = NULL 
WHERE confirme_par_superviseur IS NULL; 