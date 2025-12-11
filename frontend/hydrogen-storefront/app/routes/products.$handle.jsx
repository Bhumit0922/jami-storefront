// import React from "react";
// import { useLoaderData } from "react-router";
// import {
//   getSelectedProductOptions,
//   Analytics,
//   useOptimisticVariant,
//   getProductOptions,
//   getAdjacentAndFirstAvailableVariants,
//   useSelectedOptionInUrlParam,
// } from "@shopify/hydrogen";

// import { ProductPrice } from "~/components/ProductPrice";
// import { ProductImage } from "~/components/ProductImage";
// import { ProductForm } from "~/components/ProductForm";
// import { redirectIfHandleIsLocalized } from "~/lib/redirect";

// /* ------------------------ META ------------------------ */
// export const meta = ({ data }) => {
//   return [
//     { title: `Hydrogen | ${data?.product.title ?? ""}` },
//     {
//       rel: "canonical",
//       href: `/products/${data?.product.handle}`,
//     },
//   ];
// };

// /* ------------------------ LOADER ------------------------ */
// export async function loader(args) {
//   const deferredData = loadDeferredData(args);
//   const criticalData = await loadCriticalData(args);
//   const { product, recommended } = useLoaderData();
//   const recommendedProducts = recommended?.productRecommendations || [];


//   // Fetch recommended products
//   const recommended = await args.context.storefront.query(
//     RECOMMENDED_PRODUCTS_QUERY,
//     { variables: { handle: args.params.handle } }
//   );

//   return { ...deferredData, ...criticalData, recommended };
// }

// async function loadCriticalData({ context, params, request }) {
//   const { handle } = params;
//   const { storefront } = context;

//   if (!handle) throw new Error("Expected product handle to be defined");

//   const [{ product }] = await Promise.all([
//     storefront.query(PRODUCT_QUERY, {
//       variables: { handle, selectedOptions: getSelectedProductOptions(request) },
//     }),
//   ]);

//   if (!product?.id) throw new Response(null, { status: 404 });

//   redirectIfHandleIsLocalized(request, { handle, data: product });

//   return { product };
// }

// function loadDeferredData() {
//   return {}; // future: reviews, recommendations, etc.
// }

// /* =========================================================
//    PRODUCT PAGE COMPONENT
// ========================================================= */
// export default function Product() {
//   const [viewerOpen, setViewerOpen] = React.useState(false);
//   const { product } = useLoaderData();

//   const selectedVariant = useOptimisticVariant(
//     product.selectedOrFirstAvailableVariant,
//     getAdjacentAndFirstAvailableVariants(product)
//   );

//   useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

//   const productOptions = getProductOptions({
//     ...product,
//     selectedOrFirstAvailableVariant: selectedVariant,
//   });

//   const { title, descriptionHtml } = product;

//   return (
//     <>
//       <div className="product-page">
//         {/* LEFT – PRODUCT IMAGE */}
//         <div className="product-gallery">
//           <ProductImage
//             image={selectedVariant?.image}
//             onClick={() => setViewerOpen(true)}
//             className="clickable-product-image"
//           />
//         </div>

//         {/* RIGHT – PRODUCT DETAILS */}
//         <div className="product-info">
//           <h1 className="product-title">{title}</h1>

//           <ProductPrice
//             price={selectedVariant?.price}
//             compareAtPrice={selectedVariant?.compareAtPrice}
//           />

//           <div className="product-divider"></div>

//           <ProductForm
//             productOptions={productOptions}
//             selectedVariant={selectedVariant}
//             buttonText="Add to Bag"
//             buttonClass="product-add-btn"
//           />

//           <div className="product-divider"></div>

//           <h3 className="desc-heading">Product Description</h3>
//           <div
//             className="product-description"
//             dangerouslySetInnerHTML={{ __html: descriptionHtml }}
//           />
//         </div>

//         {/* FULLSCREEN IMAGE VIEWER */}
//         {viewerOpen && (
//           <div
//             className="image-viewer-overlay"
//             role="button"
//             tabIndex={0}
//             onClick={() => setViewerOpen(false)}
//             onKeyDown={(e) =>
//               (e.key === "Enter" || e.key === "Escape" || e.key === " ") &&
//               setViewerOpen(false)
//             }
//             aria-label="Close product preview"
//           >
//             <div
//               className="image-viewer-content"
//               role="presentation"
//               tabIndex={-1}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <img
//                 src={selectedVariant?.image?.url}
//                 alt={selectedVariant?.image?.altText || "Product preview"}
//                 className="viewer-image"
//               />
//             </div>
//           </div>
//         )}
//         {/* ---------------------------
//          Recommended Products
//         ---------------------------- */}
//         {recommendedProducts?.length > 0 && (
//           <section className="recommended-section">
//             <h2>You May Also Like</h2>

//             <div className="recommended-grid">
//               {recommendedProducts.map((p) => (
//                 <Link key={p.id} to={`/products/${p.handle}`} className="recommended-card">
//                   <img src={p.featuredImage?.url} alt={p.title} />
//                   <h4>{p.title}</h4>
//                   <p className="rec-price">₹{p.priceRange.minVariantPrice.amount}</p>
//                 </Link>
//               ))}
//             </div>
//           </section>
//         )}
//         {/* FLOATING ADD-TO-BAG BAR (Mobile Only) */}
//         <div className="floating-addbar">
//           <div className="addbar-info">
//             <p className="addbar-title">{title}</p>
//             <p className="addbar-price">₹{selectedVariant?.price?.amount}</p>
//           </div>

//           <ProductForm
//             productOptions={productOptions}
//             selectedVariant={selectedVariant}
//             buttonClass="addbar-btn"
//             buttonText="Add to Bag"
//           />
//         </div>
//       </div>

//       {/* ANALYTICS MUST BE OUTSIDE UI */}
//       <Analytics.ProductView
//         data={{
//           products: [
//             {
//               id: product.id,
//               title: product.title,
//               price: selectedVariant?.price.amount || "0",
//               vendor: product.vendor,
//               variantId: selectedVariant?.id || "",
//               variantTitle: selectedVariant?.title || "",
//               quantity: 1,
//             },
//           ],
//         }}
//       />
//     </>
//   );
// }

// /* =========================================================
//    GRAPHQL QUERIES
// ========================================================= */

// const PRODUCT_VARIANT_FRAGMENT = `#graphql
//   fragment ProductVariant on ProductVariant {
//     availableForSale
//     compareAtPrice { amount currencyCode }
//     id
//     image { id url altText width height }
//     price { amount currencyCode }
//     product { title handle }
//     selectedOptions { name value }
//     sku
//     title
//     unitPrice { amount currencyCode }
//   }
// `;

// const PRODUCT_FRAGMENT = `#graphql
//   fragment Product on Product {
//     id
//     title
//     vendor
//     handle
//     descriptionHtml
//     description
//     encodedVariantExistence
//     encodedVariantAvailability

//     options {
//       name
//       optionValues {
//         name
//         firstSelectableVariant { ...ProductVariant }
//         swatch {
//           color
//           image { previewImage { url } }
//         }
//       }
//     }

//     selectedOrFirstAvailableVariant(
//       selectedOptions: $selectedOptions
//       ignoreUnknownOptions: true
//       caseInsensitiveMatch: true
//     ) { ...ProductVariant }

//     adjacentVariants(selectedOptions: $selectedOptions) {
//       ...ProductVariant
//     }

//     seo { description title }
//   }
//   ${PRODUCT_VARIANT_FRAGMENT}
// `;

// const PRODUCT_QUERY = `#graphql
//   query Product(
//     $country: CountryCode
//     $handle: String!
//     $language: LanguageCode
//     $selectedOptions: [SelectedOptionInput!]!
//   ) @inContext(country: $country, language: $language) {
//     product(handle: $handle) {
//       ...Product
//     }
//   }
//   ${PRODUCT_FRAGMENT}
// `;

// const RECOMMENDED_QUERY = `#graphql
//   fragment RecommendedProduct on Product {
//     id
//     title
//     handle
//     featuredImage {
//       url
//       altText
//     }
//     priceRange {
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//   }

//   query RecommendedProducts(
//     $country: CountryCode
//     $language: LanguageCode
//     $handle: String!
//   ) @inContext(country: $country, language: $language) {
//     productRecommendations(productId: $handle)
//   }
// `;

// const RECOMMENDED_PRODUCTS_QUERY = `#graphql
//   query RecommendedProducts($handle: String!) {
//     productRecommendations(productId: $handle) {
//       id
//       title
//       handle
//       featuredImage {
//         url
//         altText
//       }
//       priceRange {
//         minVariantPrice {
//           amount
//         }
//       }
//     }
//   }
// `;

import React from "react";
import { useLoaderData, Link } from "react-router";
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from "@shopify/hydrogen";

import { ProductPrice } from "~/components/ProductPrice";
import { ProductImage } from "~/components/ProductImage";
import { ProductForm } from "~/components/ProductForm";
import { redirectIfHandleIsLocalized } from "~/lib/redirect";

/* ------------------------ META ------------------------ */
export const meta = ({ data }) => {
  return [
    { title: `Hydrogen | ${data?.product.title ?? ""}` },
    {
      rel: "canonical",
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/* ------------------------ LOADER ------------------------ */
export async function loader({ context, params, request }) {
  const { storefront } = context;
  const { handle } = params;

  // 1) Fetch product
  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: { handle, selectedOptions: getSelectedProductOptions(request) },
  });

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle, data: product });

  // 2) Fetch recommended products (correct API)
  const recommendedData = await storefront.query(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: {
        productId: product.id, // IMPORTANT: must be product.id, not handle
      },
    }
  );

  return {
    product,
    recommendedProducts: recommendedData?.productRecommendations ?? [],
  };
}

/* ------------------------ PRODUCT PAGE ------------------------ */
export default function Product() {
  const { product, recommendedProducts } = useLoaderData();
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product)
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml } = product;

  return (
    <>
      <div className="product-page page-transition">

        {/* IMAGE SECTION */}
        <div className="product-gallery fade-in-up">
          <ProductImage
            image={selectedVariant?.image}
            onClick={() => setViewerOpen(true)}
            className="clickable-product-image"
          />
        </div>

        {/* INFO SECTION */}
        <div className="product-info fade-in-delayed">
          <h1 className="product-title fade-in-up">{title}</h1>

          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />

          <div className="product-divider"></div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            buttonText="Add to Bag"
            buttonClass="product-add-btn"
          />

          <div className="product-divider"></div>

          <h3 className="desc-heading fade-in-up">Product Description</h3>
          <div
            className="product-description fade-in-soft"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>

        {/* FULL SCREEN VIEWER */}
        {viewerOpen && (
          <div
            className="image-viewer-overlay"
            role="button"
            tabIndex={0}
            onClick={() => setViewerOpen(false)}
            onKeyDown={(e) =>
              ["Enter", "Escape", " "].includes(e.key) &&
              setViewerOpen(false)
            }
          >
            <div
              className="image-viewer-content"
              role="presentation"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >

              <img
                src={selectedVariant?.image?.url}
                alt={selectedVariant?.image?.altText || "Product preview"}
                className="viewer-image"
              />
            </div>
          </div>
        )}

        {/* ---------------------------
             Recommended Products
        ---------------------------- */}
        {recommendedProducts.length > 0 && (
          <section className="recommended-section fade-in-delayed">
            <h2>You May Also Like</h2>

            <div className="recommended-grid">
              {recommendedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.handle}`} className="recommended-card fade-in-up">
                  <img src={p.featuredImage?.url} alt={p.title} />
                  <h4>{p.title}</h4>
                  <p className="rec-price">₹{p.priceRange.minVariantPrice.amount}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FLOATING ADD BAR */}
        <div className="floating-addbar fade-in-soft">
          <div className="addbar-info">
            <p className="addbar-title">{title}</p>
            <p className="addbar-price">₹{selectedVariant?.price?.amount}</p>
          </div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            buttonClass="addbar-btn"
            buttonText="Add to Bag"
          />
        </div>
      </div>

      {/* ANALYTICS */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount,
              vendor: product.vendor,
              variantId: selectedVariant?.id,
              variantTitle: selectedVariant?.title,
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

/* ------------------------ QUERIES ------------------------ */

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
        }
      }
    }
  }
`;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability

    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }

    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) { ...ProductVariant }

    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }

    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

export const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;
