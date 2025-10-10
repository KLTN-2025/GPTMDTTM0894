"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Button, Image, Spinner } from "react-bootstrap";
import axios from "axios";
import API_CONFIG from "@/config/api";

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  useEffect(() => {
    // Xóa toàn bộ cart sau khi đặt hàng thành công
    const clearCart = async () => {
      try {
        console.log('Starting cart clearing process...');
        
        // Lấy customer ID từ localStorage hoặc từ token
        let customerId = localStorage.getItem('id_customer');
        
        if (!customerId) {
          // Fallback: lấy từ token
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              customerId = payload?.id_customer?.toString();
              console.log('Got customer ID from token:', customerId);
            } catch (err) {
              console.error('Error parsing token:', err);
            }
          }
        }
        
        if (!customerId) {
          console.log('No customer ID found, skipping cart clear');
          return;
        }

        console.log('Customer ID:', customerId);

        // Lấy tất cả cart items của customer
        const cartResponse = await axios.get(API_CONFIG.getApiUrl(`/cart/customer/${customerId}`));
        const cartItems = cartResponse.data.items || [];
        console.log('Cart items found:', cartItems.length);

        if (cartItems.length === 0) {
          console.log('Cart is already empty');
          return;
        }

        // Xóa từng cart item
        const deletePromises = cartItems.map(item => 
          axios.delete(API_CONFIG.getApiUrl(`/cart/delete/${customerId}`), {
            data: { id_cart_items: item.id_cart_items }
          })
        );

        await Promise.all(deletePromises);
        console.log(`✅ Successfully cleared ${cartItems.length} items from cart`);

        // Cập nhật localStorage cart count
        localStorage.setItem('cartCount', '0');
        
        // Clear applied voucher after successful order
        localStorage.removeItem('appliedVoucher');
        
        // Dispatch custom event để update header cart count
        window.dispatchEvent(new Event('cartUpdated'));

      } catch (error) {
        console.error('Error clearing cart:', error);
        // Không hiển thị lỗi cho user vì đây không phải lỗi critical
      }
    };

    // Xác nhận thanh toán MoMo thành công
    const confirmOnlinePayment = async () => {
      if (!orderId) {
        console.log('No orderId found, skipping payment confirmation');
        return;
      }

      try {
         const realOrderId = orderId.replace('ORDER_', '');
        const response = await axios.post(API_CONFIG.getApiUrl('/order/confirm-payment'), {
          orderId: parseInt(realOrderId)
        });

      } catch (error) {
        console.error('❌ Error confirming payment:', error);
        if (error.response?.status === 400) {
          console.log('Order may already be confirmed or not eligible for confirmation');
        }
      }
    };

    // Xóa cart nếu có orderId HOẶC có resultCode=0 (thanh toán thành công)
    const resultCode = searchParams.get("resultCode");
    const isPaymentSuccess = resultCode === "0"; // MoMo success code
    
    console.log('=== ThankYou Page Debug ===');
    console.log('Order ID:', orderId);
    console.log('Result Code:', resultCode);
    console.log('Is Payment Success:', isPaymentSuccess);
    console.log('Customer ID from localStorage:', localStorage.getItem('id_customer'));
    console.log('All URL params:', Object.fromEntries(searchParams.entries()));
    
    if (orderId || isPaymentSuccess) {
      console.log('Conditions met, clearing cart...');
      clearCart();
      
      // Nếu là thanh toán MoMo thành công, tự động xác nhận payment
      if (isPaymentSuccess && orderId) {
        console.log('MoMo payment successful, confirming order...');
        confirmOnlinePayment();
      }
    } else {
      console.log('Conditions NOT met, cart will not be cleared');
    }
  }, [orderId, searchParams]);

  return (
     <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3b82f6, #1e40af)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Image
              src="https://media.tenor.com/iHXx1jpq51UAAAAM/cheers-leonardo-di-caprio.gif"
              alt="Thank You"
              roundedCircle
              fluid
              style={{
                width: "250px",
                height: "250px",
                marginBottom: "25px",
                boxShadow: "0 0 30px rgba(255, 255, 255, 0.7)",
                animation: "pulse 2s infinite",
              }}
            />
            <h1 className="mb-3" style={{ fontWeight: "700", textShadow: "0 0 15px rgba(255,255,255,0.9)" }}>
              Cảm ơn bạn đã đặt hàng!
            </h1>
            {orderId && (
              <p className="fs-5 fw-semibold">
                Mã đơn hàng của bạn: <strong>{orderId}</strong>
              </p>
            )}
            {searchParams.get("resultCode") === "0" && (
              <div className="mb-3">
                <p className="fs-6 text-success">
                  ✅ Thanh toán MoMo thành công!
                </p>
                <p className="fs-6">
                  Mã giao dịch: <strong>{searchParams.get("transId")}</strong>
                </p>
              </div>
            )}
            <p className="fs-6 mb-1">
              Chúng tôi sẽ liên hệ và xử lý đơn hàng sớm nhất.
            </p>
            {/* <p className="fst-italic" style={{ opacity: 0.8 }}>
              Bạn sẽ được chuyển về trang chủ sau vài giây...
            </p> */}
            <Button
              variant="light"
              size="lg"
              onClick={() => router.push("/")}
              style={{ color: "#1e40af", fontWeight: "600", borderRadius: "30px", marginTop: "20px" }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "#1e40af";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#1e40af";
              }}
            >
              Về trang chủ ngay
            </Button>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 1);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
        }
      `}</style>
    </div>
  );
}

// Loading component
function ThankYouLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3b82f6, #1e40af)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem', marginBottom: '20px' }}>
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
            <h3>Đang xử lý...</h3>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouLoading />}>
      <ThankYouContent />
    </Suspense>
  );
}
