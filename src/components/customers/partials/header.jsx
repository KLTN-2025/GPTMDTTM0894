"use client";
import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API_CONFIG from "@/config/api";
const HeaderClient = () => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const [cartItems, setCartItems] = useState([]);

  // Thêm state cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load danh mục cha
  useEffect(() => {
    axios.get(API_CONFIG.getApiUrl("/categories/parent"))
      .then(res => setParentCategories(res.data))
      .catch(err => console.error("Lỗi load danh mục:", err));
  }, []);

  // Kiểm tra đăng nhập và trạng thái user
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setCartItems([]);
        
        return;
      }

      try {
        const res = await axios.get(API_CONFIG.getApiUrl("/customers/profile"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;
        setCustomer(user);
        if (user.status === false) {
          alert(`Tài khoản của bạn đã bị chặn: ${user.block_reason || "Không rõ lý do"}`);
          localStorage.removeItem('token');
          localStorage.removeItem('id_customer'); // xoá luôn nếu bị chặn
          setIsLoggedIn(false);
          setCartItems([]);
          router.push('/login');
        } else {
          localStorage.setItem('id_customer', user.id_customer);
          setIsLoggedIn(true);

          // Lấy giỏ hàng theo id_customer
          const idCustomer = user.id_customer;
          axios.get(API_CONFIG.getApiUrl(`/cart/customer/${idCustomer}`))
            .then(res => {
              // Dữ liệu server trả về có thể nằm trong res.data.items
              setCartItems(res.data.items || []);
            })
            .catch(err => {
              console.error("Lỗi khi lấy giỏ hàng:", err);
              setCartItems([]);
            });
        }
      } catch (err) {
        console.error("Lỗi khi xác thực token:", err);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setCartItems([]);
        router.push('/login');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);

    window.addEventListener('storage', checkStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStatus);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id_customer');
    setIsLoggedIn(false);
    setCartItems([]);

    startTransition(() => {
      router.push('/');
    });
  };

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      axios.get(API_CONFIG.getApiUrl(`/products/search?q=${searchTerm}`))
        .then(res => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <>
      {/* Navbar trên cùng */}
      <nav className="navbar navbar-expand-lg bg-dark navbar-light d-none d-lg-block" id="templatemo_nav_top">
        <div className="container text-light">
          <div className="w-100 d-flex justify-content-between">
            <div>
              <i className="fa fa-envelope mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="mailto:tonybuoisang@gmail.com">tonybuoisang@gmail.com</a>
              <i className="fa fa-phone mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="tel:0777527125">0777527125</a>
            </div>
            <div>
              <a className="text-light" href="https://fb.com/templatemo" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://twitter.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin fa-sm fa-fw"></i></a>
            </div>
          </div>
        </div>
      </nav>

      {/* Navbar chính */}
      <nav className="navbar navbar-expand-lg navbar-light shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <Link href="/" className="navbar-brand text-success logo h1 align-self-center">
            <img src="/assets/image/IMG_2254.jpg" 
            alt="logo" 
            style={{ width: "auto", height: "60px" }} />
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#templatemo_main_nav" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="align-self-center collapse navbar-collapse flex-fill d-lg-flex justify-content-lg-between" id="templatemo_main_nav">

            <div className="flex-fill">
              <ul className="nav navbar-nav d-flex justify-content-between mx-lg-auto">
                <li className="nav-item">
                  <Link href="/" className="nav-link">Trang Chủ</Link>
                </li>
                
                {parentCategories.map(cat => (
                      <li className="nav-item mx-2" key={cat.category_id} >
                        <Link href={`/products/${cat.name}`} className="nav-link">
                          {cat.name}
                        </Link>
                      </li>
                  ))}
    
                <li className="nav-item">
                  <Link href="/contact" className="nav-link">Liên Hệ</Link>
                </li>
              </ul>
            </div>

            <div className="navbar align-self-center d-flex">
              <div className="d-lg-none flex-sm-fill mt-3 mb-4 col-7 col-sm-auto pr-3">
                <div className="input-group">
                  <input type="text" className="form-control" id="inputMobileSearch" placeholder="Tìm kiếm sản phẩm...." />
                  <div className="input-group-text">
                    <i className="fa fa-fw fa-search"></i>
                  </div>
                </div>
              </div>

              <a className="nav-icon d-none d-lg-inline" href="#" data-bs-toggle="modal" data-bs-target="#templatemo_search">
                <i className="fa fa-fw fa-search text-dark mr-2"></i>
              </a>

              <Link href="/cart" className="nav-icon position-relative text-decoration-none">
                <i className="fa fa-fw fa-cart-arrow-down text-dark mr-1" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-dark">
                  {totalQuantity > 0 ? totalQuantity : 0}
                </span>
              </Link>

              <div className="dropdown">
                <a
                  className="nav-icon position-relative text-decoration-none d-flex align-items-center gap-2"
                  href="#"
                  id="accountDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa fa-fw fa-user text-dark"></i>
                      
                </a>
                <ul className="dropdown-menu dropdown-menu-end mt-2" aria-labelledby="accountDropdown">
                  {!isLoggedIn ? (
                    <>
                      <li>
                        <Link href="/login" className="dropdown-item">Đăng nhập</Link>
                      </li>
                      <li>
                        <Link href="/register" className="dropdown-item">Đăng ký</Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link href="/profile" className="dropdown-item">Tài khoản</Link>
                      </li>
                      <li>
                        <a onClick={handleLogout} className="dropdown-item" style={{ cursor: 'pointer' }}>
                          Đăng xuất
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {isLoggedIn && customer && (
                <span className="text-dark ">Xin chào, {customer.name}</span>
              )} 
            </div>
          </div>
        </div>
      </nav>
      

      {/* Modal search */}
      <div
        className="modal fade bg-white"
        id="templatemo_search"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="w-100 pt-1 mb-5 text-right">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form
            className="modal-content modal-body border-0 p-0"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(
                  searchTerm.trim()
                )}`;
              }
            }}
          >
            <div className="input-group mb-2 position-relative">
              <input
                type="text"
                className="form-control"
                id="inputModalSearch"
                name="q"
                placeholder="Tìm kiếm sản phẩm..."
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(true)}
              />
              <button
                type="submit"
                className="input-group-text bg-success text-light"
              >
                <i className="fa fa-fw fa-search text-white"></i>
              </button>

              {/* Dropdown gợi ý */}
              {showSuggestions && searchTerm && (
                <div
                  className="list-group position-absolute w-100"
                  style={{ top: '100%', zIndex: 1050, overflowY: 'auto' }}
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      // Thay vì Link, dùng <a> + xử lý onClick thủ công
                      <a
                        key={item.products_id || item.id_products}
                        href="#"
                        className="list-group-item list-group-item-action d-flex align-items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSuggestions(false);

                          // Đóng modal thủ công
                          const modalEl = document.getElementById('templatemo_search');
                          if (modalEl) {
                            const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
                            if (modalInstance) {
                              modalInstance.hide();
                            }
                          }

                          // Điều hướng Next.js
                          router.push(
                            `/productDetail/${item.products_slug}`
                          );
                        }}
                      >
                        <img
                          src={
                            item.main_image_url
                              ? `http://localhost:5000${item.main_image_url}`
                              : '/default-product.png'
                          }
                          alt={item.products_name}
                          style={{ width: 'auto', height: 70, objectFit: 'cover' }}
                          className="me-2"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
                          }}
                        />
                        <div>
                          {item.products_name}
                          <br />
                          <small className="text-muted">
                            Giá:{' '}
                            {item.market_price
                              ? item.market_price.toLocaleString('vi-VN') + '₫'
                              : 'Liên hệ'}
                          </small>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="list-group-item text-muted">
                      Không tìm thấy sản phẩm
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default HeaderClient;
