import db from '../config/pg';

export interface ProductImage {
  id?: number;
  product_id: number;
  url: string;
  alt?: string;
  sort_order?: number;
  created_at?: string;
}

export const createProductImage = async (img: ProductImage) => {
  const res = await db.query(
    `INSERT INTO product_images (product_id, url, alt, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [img.product_id, img.url, img.alt ?? null, img.sort_order ?? 0]
  );
  return res.rows[0];
};

export const getImagesByProduct = async (product_id: number) => {
  const res = await db.query('SELECT * FROM product_images WHERE product_id=$1 ORDER BY sort_order', [product_id]);
  return res.rows;
};

export const getThumbnailByProduct = async (product_id: number) => {
  const res = await db.query('SELECT url FROM product_images WHERE product_id=$1 ORDER BY sort_order LIMIT 1', [product_id]);
  return res.rows[0]?.url ?? null;
};