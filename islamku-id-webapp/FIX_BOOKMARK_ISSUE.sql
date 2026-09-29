-- SCRIPT: Fix Bookmark 401 Issue
-- Database: Neon PostgreSQL
-- Created: 2026-09-28

-- =============================================================================
-- STEP 1: Drop old table (if exists) dan buat yang baru dengan struktur benar
-- =============================================================================

DROP TABLE IF EXISTS app_store CASCADE;

CREATE TABLE app_store (
  id SMALLINT PRIMARY KEY DEFAULT 1,  -- Hanya 1 record (SINGLETON PATTERN)
  data JSONB NOT NULL DEFAULT '{"users":[],"bookmarks":{},"contacts":[],"preferences":{}}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add unique constraint supaya ON CONFLICT berfungsi
ALTER TABLE app_store ADD CONSTRAINT app_store_id_unique UNIQUE(id);

-- =============================================================================
-- STEP 2: Inisialisasi dengan data kosong
-- =============================================================================

INSERT INTO app_store (id, data) 
VALUES (
  1,
  '{"users":[],"bookmarks":{},"contacts":[],"preferences":{}}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 3: Verify table created
-- =============================================================================

SELECT * FROM app_store;

-- Expected output:
-- id |                                           data                                            | created_at | updated_at
-- ---|--------------------------------------------------------------------------------------------|-----------|-----------
--  1 | {"users": [], "bookmarks": {}, "contacts": [], "preferences": {}}                        | [timestamp] | [timestamp]

-- =============================================================================
-- NOTES
-- =============================================================================
/*
Perubahan yang dilakukan:

1. Struktur Table:
   - id: SMALLINT PRIMARY KEY DEFAULT 1 (selalu 1, singleton pattern)
   - data: JSONB NOT NULL (menyimpan semua data dalam format JSON)
   - created_at, updated_at: timestamps untuk audit

2. Fix untuk writeStore():
   - Sekarang ON CONFLICT (id) DO UPDATE bekerja karena ada UNIQUE constraint
   - Setiap write akan UPDATE bukan INSERT
   - Data lama akan diganti dengan data baru

3. Struktur data JSON:
   {
     "users": [...],        // array of user objects
     "bookmarks": {...},    // object with userId as key
     "contacts": [...],     // array of contact objects  
     "preferences": {...}   // object with userId as key
   }

4. Keuntungan singleton pattern:
   - Hanya satu row di database
   - Lebih mudah transactional
   - Atomic updates untuk semua data
*/

-- =============================================================================
-- STEP 4: Test data (opsional - untuk testing)
-- =============================================================================

-- Kalau perlu test dengan data sample, uncomment bagian ini:
/*
UPDATE app_store SET data = jsonb_build_object(
  'users', jsonb_build_array(
    jsonb_build_object(
      'id', 'test-user-1',
      'name', 'Test User',
      'email', 'test@example.com',
      'passwordSalt', 'test-salt',
      'passwordHash', 'test-hash',
      'createdAt', NOW()::text
    )
  ),
  'bookmarks', jsonb_build_object(
    'test-user-1', jsonb_build_object(
      'nomor', 2,
      'ayat', 3,
      'namaLatin', 'Al-Baqarah',
      'updatedAt', NOW()::text
    )
  ),
  'contacts', '[]'::jsonb,
  'preferences', '{}'::jsonb
) WHERE id = 1;
*/
