
export default function AdminLoginLayout({ children }) {
  console.log("Render admin/login/layout");
  
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ height: "100vh", padding: "1rem" }}
    >
      {children}
    </div>
  );
}
