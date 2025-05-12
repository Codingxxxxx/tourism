import PageCategory from '@/components/pages/PageCategory';
import { getCategories } from '@/server/actions/category';

export default async function Page() {
  const { categories, meta } = await getCategories({ limit: '10', offset: '0' })
  return (
    <PageCategory categories={categories} paginationMeta={meta} />
  )
}