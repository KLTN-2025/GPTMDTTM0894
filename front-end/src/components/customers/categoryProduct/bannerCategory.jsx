import Image from "next/image";
import "../../../../public/assets/css/BannerCategory.css"; // Đúng đuôi .css

export default function BannerCategory({ bannerImg, title, subText, name }) {
  const imageSrc = bannerImg
    ? `http://localhost:5000/uploads/${bannerImg}`
    : "/default-banner.jpg";

  return (
    <div className="banner position-relative mb-4">
      <div className="banner-overlay text-center text-white d-flex flex-column justify-content-center align-items-center mt-2">
        <h1 className="banner-title text-dark">{name}</h1>
        <p className="text-center text-dark fs-5">
          {subText}
        </p>
      </div>
      <Image
        src={imageSrc}
        alt={title || "Banner iPhone"}
        width={1200}
        height={400}
        className="banner-image"
        unoptimized
      />
    </div>
  );
}
