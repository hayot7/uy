import db from '../config/pg';

export interface Category {
  id?: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  position?: number;
  created_at?: string;
}

export const createCategory = async (c: Category) => {
  const res = await db.query(
    `INSERT INTO categories (name, slug, parent_id, position) VALUES ($1,$2,$3,$4) RETURNING *`,
    [c.name, c.slug ?? null, c.parent_id ?? null, c.position ?? 0]
  );
  return res.rows[0];
};

export const getCategories = async () => {
  const res = await db.query('SELECT * FROM categories ORDER BY position, id');
  return res.rows;
};

// Optionally: get tree structure
export const getCategoriesTree = async () => {
  const rows = (await db.query('SELECT * FROM categories ORDER BY position, id')).rows;
  const map: Record<number, any> = {};
  const roots: any[] = [];
  rows.forEach((r: any) => {
    map[r.id] = { ...r, children: [] };
  });
  rows.forEach((r: any) => {
    if (r.parent_id) map[r.parent_id].children.push(map[r.id]);
    else roots.push(map[r.id]);
  });
  return roots;
};