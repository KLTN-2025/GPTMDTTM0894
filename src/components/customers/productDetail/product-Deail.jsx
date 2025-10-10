// ProductDeatail.jsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import '@/styles/productDetail.css';
import ProductActions from "./productAction";
import ProductDescription from "./productDescription";
import ProductGallery from "./productGallery";
import ProductReview from "./productReview";
import ProductSpec from "./productSpec";
import ProductOptions from "./productOptions";
import ProductTitle from "./productTitle";
// import RelatedProducts from "./relatedProducts";
import API_CONFIG from "@/config/api";

const baseURL = API_CONFIG.BACKEND_URL;

export default function ProductDeatail({ product, productId }) {
  const params = useParams();
  const [productData, setProductData] = useState(product || null);
  const [imagesForColor, setImagesForColor] = useState([]);
  const [idCustomer, setIdCustomer] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(productData?.products_sale_price || 0);
  const [selectedOriginalPrice, setSelectedOriginalPrice] = useState(productData?.products_market_price || 0);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  console.log(product);

  // Hàm giải mã token lấy id_customer
  const getCustomerIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id_customer || null;
    } catch (err) {
      console.error("Không giải mã được token:", err);
      return null;
    }
  };

  useEffect(() => {
    setQuantity(1);
  }, [selectedSku]);

  const handleAddToCart = async () => {
    if (!idCustomer) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return;
    }

    if (!selectedSku) {
      toast.warning("Vui lòng chọn đầy đủ các tuỳ chọn sản phẩm!");
      return;
    }

    const payload = {
      id_customer: idCustomer,
      id_product: productData.id_products,
      quantity: quantity,
      attribute_value_ids: selectedSku.option_combo.map(o => o.id_value),
    };

    try {
      await axios.post(`${baseURL}/api/cart/add`, payload);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("❌ Thêm giỏ hàng lỗi:", err);
      const msg = err?.response?.data?.message || "Không thể thêm vào giỏ hàng.";
      toast.error(msg);
    }
  };

  // Lấy id_customer khi mounted
  useEffect(() => {
    const id = getCustomerIdFromToken();
    if (id) setIdCustomer(id);
  }, []);

  // Fetch sản phẩm nếu chưa có
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && params?.slug) {
        try {
          const res = await fetch(`${baseURL}/api/products/${params.slug}`);
          const data = await res.json();

          setProductData({
            ...data.product,
            attributes: data.attributes,
            skus: data.skus,
            product_imgs: data.images,
            specs: data.specs,
          });
        } catch (error) {
          console.error("Lỗi khi fetch sản phẩm:", error);
        }
      }
    };
    fetchProduct();
  }, [params?.slug, product]);

  // Khởi tạo selectedValues, giá, SKU mặc định theo SKU đầu tiên
  useEffect(() => {
    if (productData?.skus && productData.skus.length > 0 && selectedValues.length === 0) {
      const defaultSku = productData.skus[0];
      const defaultSelectedValues = defaultSku.option_combo.map(o => o.id_value);
      setSelectedValues(defaultSelectedValues);
      setSelectedPrice(defaultSku.price_sale);
      setSelectedOriginalPrice(defaultSku.price);
      setSelectedSku(defaultSku);
    }
  }, [productData, selectedValues.length]);

  // Cập nhật selectedSku và giá khi selectedValues thay đổi
  useEffect(() => {
    if (!productData?.skus || selectedValues.length === 0) return;

    const matchedSku = productData.skus.find((sku) =>
      JSON.stringify(sku.option_combo.map(o => o.id_value).sort()) ===
      JSON.stringify(selectedValues.slice().sort())
    );

    if (matchedSku) {
      if (matchedSku.quantity > 0) {
        setSelectedPrice(matchedSku.price_sale);
        setSelectedOriginalPrice(matchedSku.price);
        setSelectedSku(matchedSku);
      } else {
        // SKU hết hàng
        setSelectedPrice(null);         // hoặc 0
        setSelectedOriginalPrice(null);
        setSelectedSku(null);
      }
    } else {
      // SKU không tồn tại với option hiện tại
      setSelectedPrice(null);           // hoặc 0
      setSelectedOriginalPrice(null);
      setSelectedSku(null);
    }
  }, [selectedValues, productData]);


  // Cập nhật ảnh theo selectedSku (ưu tiên ảnh SKU)
  useEffect(() => {
    if (!selectedSku || !selectedSku.images?.length) {
      setImagesForColor([]);
      return;
    }

    // Lấy ảnh từ SKU hiện tại
    const validImgs = selectedSku.images.filter(img => img.Img_url?.trim() !== "");
    const sortedImages = validImgs.map(img =>
      img.Img_url.startsWith("http") ? img.Img_url : baseURL + img.Img_url
    );

    // Lấy ảnh chính của SKU (is_main)
    const mainImg = validImgs.find(img => img.is_main)?.Img_url;
    const mainImgFull = mainImg
      ? (mainImg.startsWith("http") ? mainImg : baseURL + mainImg)
      : null;

    const sorted = mainImgFull
      ? [mainImgFull, ...sortedImages.filter(i => i !== mainImgFull)]
      : sortedImages;

    setImagesForColor(sorted);
  }, [selectedSku, productData]);

  // Cập nhật mainImage khi imagesForColor hoặc allImages thay đổi
  useEffect(() => {
    const allImages = (productData?.product_imgs || []).map(img => {
      const url = img.Img_url || img.image_path || img;
      return url.startsWith("http") ? url : baseURL + url;
    });

    if (imagesForColor.length > 0) {
      setMainImage(imagesForColor[0]);
    } else if (allImages.length > 0) {
      setMainImage(allImages[0]);
    } else {
      setMainImage(null);
    }
  }, [imagesForColor, productData]);

  if (!productData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }


  return (
    <>
      <ProductTitle
        name={productData.products_name}
        title={productData.products_shorts}
      />
      <section className="container split" id="buy">
        <ProductGallery
          images={imagesForColor.length > 0 ? imagesForColor : (productData.product_imgs || []).map(img => {
            const url = img.Img_url || img.image_path || img;
            return url.startsWith("http") ? url : baseURL + url;
          })}
          mainImage={mainImage}
          setMainImage={setMainImage}
        />
        <aside className="purchase" aria-labelledby="configHeading">
          <ProductOptions
            attributes={productData.attributes}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            skus={productData.skus}
            setSelectedPrice={setSelectedPrice}
            setSelectedOriginalPrice={setSelectedOriginalPrice}
            setSelectedSku={setSelectedSku}
            price={selectedPrice}
            originalPrice={selectedOriginalPrice}
            productStatus={productData.products_status}
          />
          <ProductActions
            selectedSku={selectedSku}
            idCustomer={idCustomer}
            productId={productData.id_products}
            setQuantity={setQuantity}
            quantity={quantity}
            onAddToCart={handleAddToCart}
            productStatus={productData.products_status}
          />
        </aside>
      </section>

      <ProductDescription
        description={productData.products_description || ''}
      />
      <ProductSpec
        specs={productData.specs || []}
      />
      <ProductReview
        id_products={productData.id_products}
        id_customer={idCustomer}
      />
      {/* <RelatedProducts
        categoryId={productData.category_id}
        currentProductId={productData.id_products}
      /> */}
    </>
  );
}
