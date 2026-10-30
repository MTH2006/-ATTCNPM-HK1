
-- ==================================================
-- HOTEL BOOKING WEBSITE
-- DATABASE SCHEMA UPDATES
-- ==================================================

-- Account management: Lock / Unlock users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
