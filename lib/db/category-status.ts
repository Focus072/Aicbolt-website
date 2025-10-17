import { db } from './drizzle';
import { categories, zipRequests } from './schema';
import { eq, sql, inArray } from 'drizzle-orm';

/**
 * Updates category status based on pending requests
 * Categories are only "active" when they have pending zip requests
 */
export async function updateCategoryStatus() {
  try {
    console.log('🔄 Updating category status based on pending requests...');

    // Get all category IDs that have pending requests
    const activeCategoryIds = await db
      .selectDistinct({ categoryId: zipRequests.categoryId })
      .from(zipRequests)
      .where(eq(zipRequests.status, 'pending'));

    console.log('📊 Raw active category IDs from query:', activeCategoryIds);

    const activeIds = activeCategoryIds
      .map(row => row.categoryId)
      .filter(Boolean);

    console.log('📊 Filtered active category IDs:', activeIds);

    // Update categories: set to active if they have pending requests, inactive otherwise
    const updateResult = await db
      .update(categories)
      .set({ 
        status: sql`CASE 
          WHEN id IN (
            SELECT DISTINCT category_id 
            FROM zip_requests 
            WHERE status = 'pending' AND category_id IS NOT NULL
          ) THEN 'active'::text 
          ELSE 'inactive'::text 
        END`
      })
      .returning({
        id: categories.id,
        name: categories.name,
        status: categories.status,
      });

    console.log(`✅ Updated ${updateResult.length} categories`);
    console.log(`📊 Active categories: ${updateResult.filter(c => c.status === 'active').length}`);
    console.log(`📊 Inactive categories: ${updateResult.filter(c => c.status === 'inactive').length}`);

    return updateResult;
  } catch (error) {
    console.error('❌ Error updating category status:', error);
    throw error;
  }
}

/**
 * Gets only categories that have pending requests (truly active)
 */
export async function getActiveCategories() {
  try {
    // First get all categories that have pending requests
    const activeCategoryIds = await db
      .selectDistinct({ categoryId: zipRequests.categoryId })
      .from(zipRequests)
      .where(eq(zipRequests.status, 'pending'));

    const categoryIds = activeCategoryIds
      .map(row => row.categoryId)
      .filter(Boolean);

    if (categoryIds.length === 0) {
      return [];
    }

    // Then get the full category details for those IDs
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        status: categories.status,
      })
      .from(categories)
      .where(inArray(categories.id, categoryIds))
      .orderBy(categories.name);

    return result;
  } catch (error) {
    console.error('❌ Error getting active categories:', error);
    throw error;
  }
}
