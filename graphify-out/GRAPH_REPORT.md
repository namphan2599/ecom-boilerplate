# Graph Report - apps/backend  (2026-05-06)

## Corpus Check
- 70 files · ~18,473 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 308 nodes · 346 edges · 68 communities (19 shown, 49 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Catalog Service|Catalog Service]]
- [[_COMMUNITY_Discounts Service|Discounts Service]]
- [[_COMMUNITY_Seeding Service|Seeding Service]]
- [[_COMMUNITY_Payments Service|Payments Service]]
- [[_COMMUNITY_Cart Service|Cart Service]]
- [[_COMMUNITY_Inventory Service|Inventory Service]]
- [[_COMMUNITY_Catalog Controller|Catalog Controller]]
- [[_COMMUNITY_Storage Service|Storage Service]]
- [[_COMMUNITY_Auth Controller|Auth Controller]]
- [[_COMMUNITY_Discounts Controller|Discounts Controller]]
- [[_COMMUNITY_Health Check|Health Check]]
- [[_COMMUNITY_Auth Service|Auth Service]]
- [[_COMMUNITY_Cart Controller|Cart Controller]]
- [[_COMMUNITY_Prisma Service|Prisma Service]]
- [[_COMMUNITY_App Controller|App Controller]]
- [[_COMMUNITY_Product DTOs|Product DTOs]]
- [[_COMMUNITY_Health Controller|Health Controller]]
- [[_COMMUNITY_Orders Controller|Orders Controller]]
- [[_COMMUNITY_Google Strategy|Google Strategy]]
- [[_COMMUNITY_JWT Strategy|JWT Strategy]]
- [[_COMMUNITY_Local Strategy|Local Strategy]]
- [[_COMMUNITY_Roles Guard|Roles Guard]]
- [[_COMMUNITY_Exception Filter|Exception Filter]]
- [[_COMMUNITY_Checkout Controller|Checkout Controller]]
- [[_COMMUNITY_Stripe Webhook|Stripe Webhook]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `CatalogService` - 21 edges
2. `DiscountsService` - 19 edges
3. `PaymentsService` - 18 edges
4. `CartService` - 16 edges
5. `SeedingService` - 14 edges
6. `InventoryService` - 13 edges
7. `CatalogController` - 10 edges
8. `StorageService` - 10 edges
9. `AuthController` - 7 edges
10. `DiscountsController` - 7 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (68 total, 49 thin omitted)

### Community 2 - "Seeding Service"
Cohesion: 0.19
Nodes (3): getSeedProducts(), buildSeedCouponFixtures(), SeedingService

### Community 15 - "Product DTOs"
Cohesion: 0.33
Nodes (5): CatalogCategoryDto, CatalogTagDto, CreateProductDto, ProductVariantDto, VariantPriceDto

## Knowledge Gaps
- **30 isolated node(s):** `AppModule`, `AuthModule`, `LoginDto`, `RegisterDto`, `GoogleAuthGuard` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSeedProducts()` connect `Seeding Service` to `Catalog Service`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `buildSeedCouponFixtures()` connect `Seeding Service` to `Discounts Service`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `AppModule`, `AuthModule`, `LoginDto` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._