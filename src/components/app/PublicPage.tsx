import Layout from "@/Layout/LayoutPage"

interface PublicPageProps {
  children: React.ReactNode
}

export function PublicPage({ children }: PublicPageProps) {
  return (
    <Layout showSidebar={false} contentClassName="px-4 sm:px-6 lg:px-8">
      {children}
    </Layout>
  )
}
