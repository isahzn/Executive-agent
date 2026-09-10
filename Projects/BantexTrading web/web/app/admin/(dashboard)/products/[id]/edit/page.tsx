import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { getCategories, productById } from "@/lib/catalog/store";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = productById(id);
  if (!product) notFound();

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">Edit product</h1>
          <p className="admin-pagehead__sub">
            Editing <Link href={`/category/${product.category}/${product.slug}`} target="_blank">{product.name} ↗</Link>
          </p>
        </div>
      </div>
      <AdminProductForm categories={getCategories()} product={product} />
    </>
  );
}
