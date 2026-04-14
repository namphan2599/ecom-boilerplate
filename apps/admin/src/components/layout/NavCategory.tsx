import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { Category } from "@/types"
import { Link } from "react-router-dom"

interface NavCategoryProps {
  categories: Category[]
}

export function NavCategory({ categories }: NavCategoryProps) {
  if (!categories || categories.length === 0) return null

  return (
    <>
      {categories.map((category) => (
        <SidebarMenuItem key={category.id}>
          {category.children && category.children.length > 0 ? (
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger
                render={<SidebarMenuButton />}
              >
                <span>{category.name}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {category.children.map((child) => (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton render={<Link to={`/products?category=${child.id}`} />}>
                        <span>{child.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuButton render={<Link to={`/products?category=${category.id}`} />}>
              <span>{category.name}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </>
  )
}
