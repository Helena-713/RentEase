BEGIN;

-- Enums
CREATE TYPE "enum_users_role" AS ENUM ('LAND_LORD', 'TENANT', 'ADMIN');
CREATE TYPE "enum_landlord_verifications_status" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "enum_properties_property_type" AS ENUM ('APARTMENT', 'HOUSE', 'CONDO', 'STUDIO');
CREATE TYPE "enum_properties_status" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'INACTIVE');
CREATE TYPE "enum_applications_status" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
  'COMPLETED'
);
CREATE TYPE "enum_reviews_target_type" AS ENUM ('LANDLORD', 'TENANT');

-- Tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  role "enum_users_role" NOT NULL,
  profile_image VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_unique ON users (email);

CREATE TABLE landlord_verifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  status "enum_landlord_verifications_status" NOT NULL DEFAULT 'PENDING',
  verification_document VARCHAR(255),
  rejection_reason TEXT,
  verified_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX landlord_verifications_user_id_unique ON landlord_verifications (user_id);
CREATE INDEX landlord_verifications_verified_by_idx ON landlord_verifications (verified_by);

CREATE TABLE properties (
  id UUID PRIMARY KEY,
  landlord_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  property_type "enum_properties_property_type" NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area_sqft INTEGER NOT NULL,
  status "enum_properties_status" NOT NULL DEFAULT 'AVAILABLE',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX properties_landlord_id_idx ON properties (landlord_id);

CREATE TABLE property_images (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX property_images_property_id_idx ON property_images (property_id);

CREATE UNIQUE INDEX property_images_one_cover_per_property
ON property_images (property_id)
WHERE is_cover = TRUE;

CREATE TABLE amenities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX amenities_name_unique ON amenities (name);

CREATE TABLE property_amenities (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX property_amenities_property_id_amenity_id_unique
ON property_amenities (property_id, amenity_id);

CREATE INDEX property_amenities_amenity_id_idx ON property_amenities (amenity_id);

CREATE TABLE applications (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  message TEXT,
  status "enum_applications_status" NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX applications_property_id_idx ON applications (property_id);
CREATE INDEX applications_tenant_id_idx ON applications (tenant_id);

CREATE UNIQUE INDEX applications_one_pending_per_tenant_property
ON applications (property_id, tenant_id)
WHERE status = 'PENDING';

CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON UPDATE CASCADE ON DELETE SET NULL,
  target_type "enum_reviews_target_type" NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX reviews_application_reviewer_target_unique
ON reviews (application_id, reviewer_id, target_type);

CREATE INDEX reviews_reviewer_id_idx ON reviews (reviewer_id);
CREATE INDEX reviews_reviewee_id_idx ON reviews (reviewee_id);
CREATE INDEX reviews_property_id_idx ON reviews (property_id);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX conversations_property_tenant_landlord_unique
ON conversations (property_id, tenant_id, landlord_id);

CREATE INDEX conversations_tenant_id_idx ON conversations (tenant_id);
CREATE INDEX conversations_landlord_id_idx ON conversations (landlord_id);
CREATE INDEX conversations_last_message_at_idx ON conversations (last_message_at);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX messages_sender_id_idx ON messages (sender_id);
CREATE INDEX messages_created_at_idx ON messages (created_at);

-- Admin seed (provided)
INSERT INTO users (
  id, first_name, last_name, email, password, phone, role,
  profile_image, is_active, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System',
  'Administrator',
  'admin@rentease.com',
  '$2b$10$N2diVsAp2qOLjRIcloFFQutIB6Y5t/VKtQi/em8nUpc2kmE6u7E42',
  '+10000000000',
  'ADMIN',
  NULL,
  TRUE,
  NOW(),
  NOW()
);

COMMIT;
