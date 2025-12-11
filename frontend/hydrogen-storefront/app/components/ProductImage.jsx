import { Image } from "@shopify/hydrogen";
import { useState, useRef } from "react";

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({ image }) {
  const [zoom, setZoom] = useState(false);
  const imgRef = useRef(null);

  if (!image) return <div className="product-image" />;

  const handleMouseMove = (e) => {
    if (!zoom || !imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div
      className="product-image zoom-container"
      role="img"
      aria-label={image.altText || "Product Image"}
    >
      <Image
        ref={imgRef}
        alt={image.altText || "Product Image"}
        aspectRatio="1/1"
        data={image}
        sizes="(min-width: 45em) 50vw, 100vw"
        className={`zoom-image ${zoom ? "zoom-active" : ""}`}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
