-- Vincent & Vintage — Serverless PostgreSQL Schema (Neon Free Tier)
-- 100% Modular Headless CMS Schema

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  card_image VARCHAR(500) NOT NULL,
  banner_image VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  badge VARCHAR(100),
  cta_text VARCHAR(100) DEFAULT 'EXPLORE COLLECTION',
  link_url VARCHAR(255) DEFAULT '#catalog-section',
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_blocks (
  id SERIAL PRIMARY KEY,
  block_type VARCHAR(50) NOT NULL, -- 'bento_large', 'bento_small', 'split_showcase'
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  badge VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  category_slug VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(64) UNIQUE NOT NULL,
  category_slug VARCHAR(100) REFERENCES categories(slug) ON DELETE SET NULL,
  regular_price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  fabric VARCHAR(255),
  primary_image VARCHAR(500) NOT NULL,
  hover_image VARCHAR(500),
  gallery JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[{"size":"M","stock":10},{"size":"L","stock":12},{"size":"XL","stock":8},{"size":"XXL","stock":5}]',
  colors JSONB DEFAULT '[]',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  reviews_count INT DEFAULT 18,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT TRUE,
  is_todays_deal BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  inventory_type VARCHAR(20) DEFAULT 'sizes', -- 'sizes' or 'single'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(64) NOT NULL,
  size VARCHAR(20),
  change_amount INT NOT NULL,
  new_stock INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(32) UNIQUE NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(120),
  shipping_address TEXT NOT NULL,
  delivery_zone VARCHAR(50) DEFAULT 'Inside Dhaka',
  delivery_charge NUMERIC(10, 2) DEFAULT 60.00,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
  payment_number VARCHAR(30),
  transaction_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'pending',
  items JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
