"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Button, Image } from "react-bootstrap";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Tự động chuyển về trang chủ sau 8 giây (ví dụ)
    // const timer = setTimeout(() => {
    //   router.push("/");
    // }, 8000);

    // return () => clearTimeout(timer);
  }, [router]);

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
