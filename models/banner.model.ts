import db from "../config/db"

export interface Banner {
  id?: number;
  title: string;
  image_url: string;
  link?: string;
  position?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const createBanner = async (b: Banner) => {
  const sql = `INSERT INTO banners (title, image_url, link, position, active)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const params = [b.title, b.image_url, b.link ?? null, b.position ?? 0, b.active ?? true];
  const res = await db.query(sql, params);
  return res.rows[0];
};

export const getActiveBanners = async () => {
  const res = await db.query('SELECT * FROM banners WHERE active = true ORDER BY position ASC');
  return res.rows;
};

export const getAllBanners = async () => {
  const res = await db.query('SELECT * FROM banners ORDER BY position ASC');
  return res.rows;
};