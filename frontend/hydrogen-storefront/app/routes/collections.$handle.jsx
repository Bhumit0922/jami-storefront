import React from "react";
import { redirect, useLoaderData } from "react-router";
import { getPaginationVariables, Analytics } from "@shopify/hydrogen";
import { redirectIfHandleIsLocalized } from "~/lib/redirect";

/* -------------------- META -------------------- */
export const meta = ({ data }) => {
  return [{ title: `JAMI Premium | ${data?.collection.title ?? ""}` }];
};

/* -------------------- LOADER -------------------- */
export async function loader({ context, params, request }) {
  const { storefront } = context;
  const { handle } = params;

  if (!handle) throw redirect("/collections");

  const url = new URL(request.url);

  /* Read filters */
  const sizeFilter = url.searchParams.get("size") || null;
  const priceFilter = url.searchParams.get("price") || null;

  /* Sorting */
  const sort = url.searchParams.get("sort") || "RELEVANCE";

  let sortKey = "RELEVANCE";
  let reverse = false;

  switch (sort) {
    case "PRICE_LOW":
      sortKey = "PRICE";
      break;
    case "PRICE_HIGH":
      sortKey = "PRICE";
      reverse = true;
      break;
    case "NEWEST":
      sortKey = "CREATED_AT";
      reverse = true;
      break;
  }

  /* Pagination setup */
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 50,
    pageParam: "page"
  });


  /* Fetch Collection Data */
  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        sortKey,
        reverse,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle, data: collection });

  return {
    collection,
    sizeFilter,
    priceFilter,
    sort,
  };
}

/* -------------------- COMPONENT -------------------- */
export default function Collection() {
  const { collection, sizeFilter, priceFilter, sort } = useLoaderData();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  // Fade-in animation for product cards
  React.useEffect(() => {
    const cards = document.querySelectorAll(".premium-card.fade-in");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("show"), i * 50);
    });
  }, [filteredProducts]);


  /* Helper to apply filters */
  const applyFilter = (key, value) => {
    const params = new URLSearchParams(window.location.search);

    if (value === null) params.delete(key);
    else params.set(key, value);

    window.location.search = params.toString();
  };

  /* Start with ALL products */
  let filteredProducts = [...collection.products.nodes];

  /* SIZE FILTER */
  if (sizeFilter) {
    filteredProducts = filteredProducts.filter((product) =>
      product.options?.some(
        (opt) =>
          opt.name.toLowerCase() === "size" &&
          opt.values?.includes(sizeFilter)
      )
    );
  }

  /* PRICE FILTER */
  filteredProducts = filteredProducts.filter((product) => {
    const price = Number(product.priceRange.minVariantPrice.amount);

    if (priceFilter === "UNDER_1000") return price < 1000;
    if (priceFilter === "1000_2000") return price >= 1000 && price <= 2000;
    if (priceFilter === "ABOVE_2000") return price > 2000;

    return true;
  });

  // ⭐ ADD THIS HERE — BEFORE return(...)
  React.useEffect(() => {
    const bar = document.querySelector(".filters-bar-wrapper");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          bar.classList.add("sticky");
        } else {
          bar.classList.remove("sticky");
        }
      },
      { threshold: 1 }
    );

    observer.observe(bar);
  }, []);

  return (
    <div className="collection-page">

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/" className="crumb-link">Home</a>
        <span className="crumb-separator">›</span>
        <span className="crumb-current">{collection.title}</span>
      </nav>


      {/* Header */}
      <div className="collection-header">
        <h1 className="collection-title">{collection.title}</h1>

        {/* Sort Dropdown */}
        <div className="collection-sort">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            defaultValue={sort}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set("sort", e.target.value);
              window.location.search = params.toString();
            }}
          >
            <option value="RELEVANCE">Featured</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="NEWEST">Newest</option>
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          className="mobile-filter-btn"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-filter-drawer"
        >
          Filters ⤵
        </button>

        <p className="collection-description">
          {collection.description || "Explore our premium curated styles."}
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="filters-bar-wrapper">
        <div className="filters-bar">

          {["XS", "S", "M", "L", "XL"].map((size) => (
            <button
              key={size}
              className={`filter-pill ${sizeFilter === size ? "active-pill" : ""}`}
              onClick={() => applyFilter("size", size)}
            >
              {size}
            </button>
          ))}

          <button
            className={`filter-pill ${priceFilter === "UNDER_1000" ? "active-pill" : ""}`}
            onClick={() => applyFilter("price", "UNDER_1000")}
          >
            Under ₹1000
          </button>

          <button
            className={`filter-pill ${priceFilter === "1000_2000" ? "active-pill" : ""}`}
            onClick={() => applyFilter("price", "1000_2000")}
          >
            ₹1000 - ₹2000
          </button>

          <button
            className={`filter-pill ${priceFilter === "ABOVE_2000" ? "active-pill" : ""}`}
            onClick={() => applyFilter("price", "ABOVE_2000")}
          >
            Above ₹2000
          </button>
        </div>
      </div>

      {/* ---------------- ACTIVE FILTERS ---------------- */}
      {(sizeFilter || priceFilter) && (
        <div className="active-filters">

          {sizeFilter && (
            <button
              className="active-filter-pill"
              onClick={() => applyFilter("size", null)}
              aria-label={`Remove size filter ${sizeFilter}`}
            >
              {sizeFilter} ✕
            </button>
          )}

          {priceFilter && (
            <button
              className="active-filter-pill"
              onClick={() => applyFilter("price", null)}
              aria-label={`Remove price filter ${priceFilter}`}
            >
              {priceFilter.replace("_", " ").replace("UNDER", "Under ").replace("ABOVE", "Above ")} ✕
            </button>
          )}

          <button
            className="clear-all-filters-btn"
            onClick={() => (window.location.search = "")}
          >
            Clear All
          </button>

        </div>
      )}


      {/* EMPTY STATE */}
      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <h3>No products match your filters</h3>
          <p>Try adjusting size or price filters.</p>

          <button
            className="clear-filters-btn"
            onClick={() => (window.location.search = "")}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="premium-grid">
        {filteredProducts.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.handle}`}
            className="premium-card fade-in"
          >
            <div className="premium-card-image">
              <img src={product.featuredImage?.url} alt={product.title} />
            </div>

            <div className="premium-card-info">
              <h3>{product.title}</h3>
              <p className="price">₹{product.priceRange.minVariantPrice.amount}</p>
            </div>
          </a>
        ))}
      </div>

      {/* -------------------- PAGINATION -------------------- */}
      {collection.products.pageInfo.hasPreviousPage ||
        collection.products.pageInfo.hasNextPage ? (
        <div className="pagination-container">

          {/* Previous Button */}
          {collection.products.pageInfo.hasPreviousPage ? (
            <a
              className="pagination-btn"
              href={`?page=prev`}
            >
              ← Previous
            </a>
          ) : (
            <span className="pagination-btn disabled">← Previous</span>
          )}

          {/* Next Button */}
          {collection.products.pageInfo.hasNextPage ? (
            <a
              className="pagination-btn"
              href={`?page=next`}
            >
              Next →
            </a>
          ) : (
            <span className="pagination-btn disabled">Next →</span>
          )}
        </div>
      ) : null}

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />

      {/* ---------- Mobile Bottom Drawer ---------- */}
      {drawerOpen && (
        <div
          className={`filter-drawer-overlay ${drawerOpen ? "show" : ""}`}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={(e) => {
            if (["Escape", "Enter", " "].includes(e.key)) {
              setDrawerOpen(false);
            }
          }}
        >
          <div
            id="mobile-filter-drawer"
            className={`filter-drawer ${drawerOpen ? "slide-up" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-heading"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >


            <div className="filter-drawer-header">
              <h3 id="mobile-filter-heading">Filters</h3>
              <button
                className="drawer-close-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            {/* Size Section */}
            <div className="drawer-section">
              <h4>Size</h4>
              <div className="drawer-options">
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    className={`drawer-pill ${sizeFilter === size ? "active" : ""}`}
                    onClick={() => applyFilter("size", size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="drawer-section">
              <h4>Price</h4>
              <div className="drawer-options">
                <button
                  className={`drawer-pill ${priceFilter === "UNDER_1000" ? "active" : ""}`}
                  onClick={() => applyFilter("price", "UNDER_1000")}
                >
                  Under ₹1000
                </button>

                <button
                  className={`drawer-pill ${priceFilter === "1000_2000" ? "active" : ""}`}
                  onClick={() => applyFilter("price", "1000_2000")}
                >
                  ₹1000 - ₹2000
                </button>

                <button
                  className={`drawer-pill ${priceFilter === "ABOVE_2000" ? "active" : ""}`}
                  onClick={() => applyFilter("price", "ABOVE_2000")}
                >
                  Above ₹2000
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button
                className="clear-btn"
                onClick={() => {
                  window.location.search = "";
                  setDrawerOpen(false);
                }}
              >
                Clear All
              </button>

              <button className="apply-btn" onClick={() => setDrawerOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* -------------------- GRAPHQL -------------------- */

const PRODUCT_ITEM_FRAGMENT = `#graphql
      fragment MoneyProductItem on MoneyV2 {
        amount
    currencyCode
  }
      fragment ProductItem on Product {
        id
    handle
      title
      featuredImage {
        id
      altText
      url
      width
      height
    }
      priceRange {
        minVariantPrice {...MoneyProductItem}
      maxVariantPrice {...MoneyProductItem}
    }
      options {
        name
      values
    }
  }
      `;

const COLLECTION_QUERY = `#graphql
      ${PRODUCT_ITEM_FRAGMENT}
      query Collection(
      $handle: String!
      $country: CountryCode
      $language: LanguageCode
      $first: Int
      $last: Int
      $startCursor: String
      $endCursor: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
      ) @inContext(country: $country, language: $language) {
        collection(handle: $handle) {
        id
      handle
      title
      description
      products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
      ) {
        nodes {...ProductItem}
      pageInfo {
        hasPreviousPage
          hasNextPage
      endCursor
      startCursor
        }
      }
    }
  }
      `;
