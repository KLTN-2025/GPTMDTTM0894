'use client';
import Link from "next/link";

export default function AdminBreadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/admin/dashboard" className="text-decoration-none">
            <i className="bi bi-house me-1"></i>
            Dashboard
          </Link>
        </li>
        
        {items?.map((item, index) => (
          <li 
            key={index} 
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {index === items.length - 1 ? (
              item.label
            ) : (
              <Link href={item.href} className="text-decoration-none">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
