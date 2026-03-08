import SharedLayout from "@/components/shared-layout";

export default function AppLayoutWrapperComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}
