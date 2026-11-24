-- ARTIVA Initial Schema (14 entitas + enum + indeks)

-- ENUM (aman bila sudah dibuat sebelumnya)
DO $$ BEGIN CREATE TYPE user_role           AS ENUM ('admin','member','curator'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_status         AS ENUM ('active','pending','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE artwork_status      AS ENUM ('published','hidden','removed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE comment_status      AS ENUM ('visible','deleted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE challenge_status    AS ENUM ('draft','open','closed','announced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE submission_status   AS ENUM ('submitted','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_status       AS ENUM ('pending','resolved','dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,      -- disimpan lowercase oleh aplikasi
  password_hash VARCHAR(255) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'member',
  status        user_status  NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  profile_id   SERIAL PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  display_name VARCHAR(60) NOT NULL,
  bio          TEXT,
  avatar_path  VARCHAR(255),
  website      VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS curator_verifications (
  verification_id SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reviewed_by     INT REFERENCES users(user_id),
  status          verification_status NOT NULL DEFAULT 'pending',
  note            TEXT,
  appeal_note     TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ
);
ALTER TABLE curator_verifications ADD COLUMN IF NOT EXISTS appeal_note TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_cv_one_pending ON curator_verifications(user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_cv_user_submitted ON curator_verifications(user_id, submitted_at DESC, verification_id DESC);

CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL UNIQUE,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS artworks (
  artwork_id  SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(user_id),
  category_id INT NOT NULL REFERENCES categories(category_id),
  title       VARCHAR(120) NOT NULL,
  description TEXT,
  image_path  VARCHAR(255) NOT NULL,
  status      artwork_status NOT NULL DEFAULT 'published',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  tag_id SERIAL PRIMARY KEY,
  name   VARCHAR(40) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS artwork_tags (
  artwork_id INT NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  tag_id     INT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, tag_id)
);

CREATE TABLE IF NOT EXISTS likes (
  user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id INT NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, artwork_id)
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  artwork_id INT NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, artwork_id)
);

CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  artwork_id INT NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
  user_id    INT NOT NULL REFERENCES users(user_id),
  content    TEXT NOT NULL,
  status     comment_status NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenges (
  challenge_id SERIAL PRIMARY KEY,
  curator_id   INT NOT NULL REFERENCES users(user_id),
  category_id  INT REFERENCES categories(category_id),      -- opsional
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  rules        TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       challenge_status NOT NULL DEFAULT 'draft',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_challenge_dates CHECK (end_date > start_date)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_challenges_curator_title ON challenges (curator_id, LOWER(BTRIM(title)));

CREATE TABLE IF NOT EXISTS submissions (
  submission_id SERIAL PRIMARY KEY,
  challenge_id  INT NOT NULL REFERENCES challenges(challenge_id),
  artwork_id    INT NOT NULL REFERENCES artworks(artwork_id),
  status        submission_status NOT NULL DEFAULT 'submitted',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at  TIMESTAMPTZ,
  CONSTRAINT uq_submission UNIQUE (challenge_id, artwork_id)
);

CREATE TABLE IF NOT EXISTS winners (
  winner_id     SERIAL PRIMARY KEY,
  challenge_id  INT NOT NULL REFERENCES challenges(challenge_id),
  submission_id INT NOT NULL UNIQUE REFERENCES submissions(submission_id),
  rank          SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 3),
  announced_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_winner_rank UNIQUE (challenge_id, rank)
);

CREATE TABLE IF NOT EXISTS reports (
  report_id       SERIAL PRIMARY KEY,
  reporter_id     INT NOT NULL REFERENCES users(user_id),
  artwork_id      INT NOT NULL REFERENCES artworks(artwork_id),
  handled_by      INT REFERENCES users(user_id),
  reason          VARCHAR(40) NOT NULL,
  description     TEXT,
  status          report_status NOT NULL DEFAULT 'pending',
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_report UNIQUE (reporter_id, artwork_id)
);

-- Indeks
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_artworks_cat_created ON artworks(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_user        ON artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_title_trgm  ON artworks USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status_end ON challenges(status, end_date);
CREATE INDEX IF NOT EXISTS idx_reports_status        ON reports(status);
CREATE INDEX IF NOT EXISTS idx_comments_artwork      ON comments(artwork_id, created_at);
