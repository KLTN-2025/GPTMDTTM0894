"use client";

import { CompareProvider } from '../../contexts/CompareContext';
import ProductCompare from '../../components/customers/compare/ProductCompare';
import Header from '../../components/customers/partials/header';
import Footer from '../../components/customers/partials/footer';

export default function ComparePage() {
  return (
    <CompareProvider>
      <Header />
      <ProductCompare />
      <Footer />
    </CompareProvider>
  );
}
