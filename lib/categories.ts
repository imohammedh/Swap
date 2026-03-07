export const categoryOptions = [
  { id: "all", name: "All categories" },
  { id: "vehicles", name: "Vehicles & Cars" },
  { id: "real-estate", name: "Real Estate & Properties" },
  { id: "mobiles", name: "Mobiles & Tablets" },
  { id: "electronics", name: "Electronics & Appliances" },
  { id: "furniture", name: "Furniture & Decor" },
  { id: "fashion", name: "Fashion & Beauty" },
  { id: "pets", name: "Pets" },
  { id: "kids", name: "Kids & Baby" },
] as const;

export function categoryNameById(categoryId: string) {
  return categoryOptions.find((category) => category.id === categoryId)?.name ?? "Other";
}
