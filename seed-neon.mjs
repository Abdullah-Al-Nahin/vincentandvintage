import { neon } from '@neondatabase/serverless';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './src/lib/initialData.js';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_XxCTV4h3uEiO@ep-small-block-azng5vxf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(connectionString);

async function seed() {
  console.log('Seeding Neon database (online)...');

  // Insert categories
  for (const cat of INITIAL_CATEGORIES) {
    await sql`
      INSERT INTO categories (name, slug, card_image, banner_image, sort_order)
      VALUES (${cat.name}, ${cat.slug}, ${cat.cardImage}, ${cat.bannerImage}, ${cat.id})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        card_image = EXCLUDED.card_image,
        banner_image = EXCLUDED.banner_image;
    `;
  }
  console.log(`Seeded ${INITIAL_CATEGORIES.length} categories.`);

  // Insert products
  for (const p of INITIAL_PRODUCTS) {
    await sql`
      INSERT INTO products (
        name, slug, sku, category_slug, regular_price, sale_price,
        description, fabric, primary_image, hover_image, gallery,
        sizes, colors, rating, reviews_count, is_best_seller, is_new_arrival, is_todays_deal
      ) VALUES (
        ${p.name}, ${p.slug}, ${p.sku}, ${p.categorySlug}, ${p.regularPrice}, ${p.salePrice},
        ${p.description}, ${p.fabric}, ${p.primaryImage}, ${p.hoverImage}, ${JSON.stringify(p.gallery)},
        ${JSON.stringify(p.sizes)}, ${JSON.stringify(p.colors)}, ${p.rating}, ${p.reviewsCount},
        ${p.isBestSeller}, ${p.isNewArrival}, ${p.isTodaysDeal}
      )
      ON CONFLICT (slug) DO UPDATE SET
        regular_price = EXCLUDED.regular_price,
        sale_price = EXCLUDED.sale_price,
        description = EXCLUDED.description,
        sizes = EXCLUDED.sizes;
    `;
  }
  console.log(`Seeded ${INITIAL_PRODUCTS.length} products.`);

  // Insert sample order
  await sql`
    INSERT INTO orders (
      order_number, customer_name, customer_phone, customer_email,
      shipping_address, delivery_zone, delivery_charge, subtotal, discount, total_amount,
      payment_method, status, items
    ) VALUES (
      'VV-2026-1001', 'Tanvir Ahmed', '01711-223344', 'tanvir@example.com',
      'House 14, Road 7, Dhanmondi, Dhaka', 'Inside Dhaka', 60.00, 2640.00, 0.00, 2700.00,
      'Cash on Delivery', 'processing',
      '[{"productId":1,"name":"Textured Old Money Cuban Collar Shirt | VV-101","sku":"VV-101","size":"L","color":"Sage Olive","price":1390,"quantity":1},{"productId":2,"name":"Vintage Ribbed Knitted Polo Shirt | VV-204","sku":"VV-204","size":"L","color":"Warm Bronze","price":1250,"quantity":1}]'
    )
    ON CONFLICT (order_number) DO NOTHING;
  `;
  console.log('Sample order seeded.');
  console.log('Online Neon Database Seeded successfully!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
