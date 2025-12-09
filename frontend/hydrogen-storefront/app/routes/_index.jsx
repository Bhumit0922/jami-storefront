import { Await, useLoaderData, Link } from 'react-router';
import { Suspense } from 'react';
import { Image } from '@shopify/hydrogen';
import { ProductItem } from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: 'JAMI Premium | Home' }];
};


/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context }) {
  const newArrivals = context.storefront
    .query(NEW_ARRIVALS_QUERY)
    .catch((error) => {
      console.error("New Arrivals Query Error:", error);
      return null;
    });

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error("Recommended Products Error:", error);
      return null;
    });

  return {
    recommendedProducts,
    newArrivals,
  };
}


function HeroBanner() {
  return (
    <section className='hero-banner'>
      <div className="hero-text">
        <div className="hero-text-line line-1">Premium Ethnic Wear</div>
        <div className="hero-text-line line-2">Crafted for Every Celebration</div>
        <a href="/collections/new-arrivals" className="hero-cta-btn">
          Shop New Arrivals →
        </a>
      </div>
    </section>
  )
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <HeroBanner />
      <section className='section-block'>
        <h1>Welcome to JAMI Premium</h1>
        <p style={{ marginTop: "0.5rem", fontSize: "1.1rem" }}>
          Premium Women’s Fashion • Crafted with Elegance
        </p>
      </section>

      <section className="section">
        <h2>Explore Our Collections</h2>

        {/* <div className="collection-grid">

          <div className="collection-card">
            <img src="/collection-kurtis.jpg" alt="Premium Kurtis" />
            <div className="collection-card-title">Premium Kurtis</div>

            <a href="/collections/premium-kurtis" className="cta-btn card-btn">
              Shop Kurtis
            </a>
          </div>

          <div className="collection-card">
            <img src="/collection-marriage.jpg" alt="Marriage Wear" />
            <div className="collection-card-title">Marriage Wear</div>

            <a href="/collections/marriage-wear" className="cta-btn card-btn">
              Shop Marriage Wear
            </a>
          </div>

          <div className="collection-card">
            <img src="/collection-festive.jpg" alt="Festive Wear" />
            <div className="collection-card-title">Festive Wear</div>

            <a href="/collections/festive-wear" className="cta-btn card-btn">
              Shop Festive Wear
            </a>
          </div> */}

        <div className="collection-grid">

          <div className="collection-card">
            <img src="/collection-kurtis.jpg" alt="Premium Kurtis" />
            <div className="collection-card-title">Premium Kurtis</div>
            <a href="/collections/premium-kurtis" className="cta-btn card-btn">Shop Kurtis</a>
          </div>

          <div className="collection-card">
            <img src="/collection-marriage.jpg" alt="Marriage Wear" />
            <div className="collection-card-title">Marriage Wear</div>
            <a href="/collections/marriage-wear" className="cta-btn card-btn">Shop Marriage Wear</a>
          </div>

          <div className="collection-card">
            <img src="/collection-festive.jpg" alt="Festive Wear" />
            <div className="collection-card-title">Festive Wear</div>
            <a href="/collections/festive-wear" className="cta-btn card-btn">Shop Festive Wear</a>
          </div>

        </div>

      </section >

      <section className="section">
        <h2>New Arrivals</h2>

        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data.newArrivals}>
            {(response) => {
              if (!response?.collection?.products.nodes.length)
                return <p>No new arrivals yet.</p>;

              return (
                <div className="collection-grid">
                  {response.collection.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.handle}`}
                      className="arrival-card"
                    >
                      <img src={product.featuredImage.url} alt={product.title} />
                      <div className="arrival-card-info">
                        <h3>{product.title}</h3>
                        <p className="price">
                          ₹{product.priceRange.minVariantPrice.amount}
                        </p>
                      </div>

                    </Link>
                  ))}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      <section className="section testimonials-section">
        <h2>What Our Customers Say</h2>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <img src="/user.png" alt="Customer" className="testimonial-avatar" />
            <p className="testimonial-text">
              “JAMI Premium has the most elegant ethnic wear. The fabric quality is outstanding.”
            </p>
            <h4 className="testimonial-name">bhumit Solanki</h4>
          </div>

          <div className="testimonial-card">
            <img src="/user.png" alt="Customer" className="testimonial-avatar" />
            <p className="testimonial-text">
              “Loved the festive collection! Perfect for weddings and celebrations.”
            </p>
            <h4 className="testimonial-name">Bhumit Solanki</h4>
          </div>

          <div className="testimonial-card">
            <img src="/user.png" alt="Customer" className="testimonial-avatar" />
            <p className="testimonial-text">
              “Premium designs at reasonable prices. Highly recommended!”
            </p>
            <h4 className="testimonial-name">Bhumit Solanki</h4>
          </div>
        </div>
      </section>

      {/* ---------------------------
      Premium Brand Slider
      ----------------------------- */}
      <section className="premium-slider-section">
        <div className="slider-container">
          <div className="slider-track">

            <img src="/collection-kurtis.jpg" alt="Premium Kurtis" className="slider-image" />
            <img src="/collection-marriage.jpg" alt="Marriage Wear" className="slider-image" />
            <img src="/collection-festive.jpg" alt="Festive Wear" className="slider-image" />
            <img src="/hero-banner.jpg" alt="Ethnic Wear" className="slider-image" />
            <img src="/collection-kurtis.jpg" alt="Premium Kurtis" className="slider-image" />

          </div>
        </div>
      </section>


      <section className="section why-jami">
        <h2>Why Choose JAMI Premium?</h2>

        <div className="why-grid">
          <div className="why-card">
            <img src="/icon-quality.png" alt="Premium Quality" className="why-icon" />
            <h3>Premium Quality Fabrics</h3>
            <p>Handpicked materials that feel luxurious and last longer.</p>
          </div>

          <div className="why-card">
            <img src="/icon-design.png" alt="Exclusive Designs" className="why-icon" />
            <h3>Exclusive Designer Wear</h3>
            <p>Unique ethnic styles crafted with elegance and tradition.</p>
          </div>

          <div className="why-card">
            <img src="/icon-shipping.png" alt="Fast Delivery" className="why-icon" />
            <h3>Fast & Secure Delivery</h3>
            <p>We ship quickly so your outfits arrive right on time.</p>
          </div>

          <div className="why-card">
            <img src="/icon-return.png" alt="Easy Returns" className="why-icon" />
            <h3>Easy 7-Day Returns</h3>
            <p>Shop confidently with hassle-free return support.</p>
          </div>
        </div>
      </section>

      <section className="section shop-category">
        <h2>Shop by Category</h2>

        <div className="category-grid">
          <Link to="/collections/premium-kurtis" className="category-item">
            <img src="/collection-kurtis.jpg" alt="Kurtis" />
            <p>Kurtis</p>
          </Link>

          <Link to="/collections/marriage-wear" className="category-item">
            <img src="/collection-marriage.jpg" alt="Marriage Wear" />
            <p>Marriage Wear</p>
          </Link>

          <Link to="/collections/festive-wear" className="category-item">
            <img src="/collection-festive.jpg" alt="Festive Wear" />
            <p>Festive Wear</p>
          </Link>
        </div>
      </section>

      <section className="trust-ribbon">
        <div className="trust-item">
          <span className="trust-icon">⚡</span>
          <p>Fast Delivery</p>
        </div>

        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <p>Secure Checkout</p>
        </div>

        <div className="trust-item">
          <span className="trust-icon">↩️</span>
          <p>Easy Returns</p>
        </div>

        <div className="trust-item">
          <span className="trust-icon">💳</span>
          <p>COD Available</p>
        </div>
      </section>


    </div >
  );

}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({ collection }) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const NEW_ARRIVALS_QUERY = `#graphql
  fragment NewArrivalProduct on Product {
    id
    title
    handle
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }

  query NewArrivals($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: "new-arrivals") {
      products(first: 4) {
        nodes {
          ...NewArrivalProduct
        }
      }
    }
  }
`;


/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import ('storefrontapi.generated').NewArrivalsQuery} NewArrivalsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
