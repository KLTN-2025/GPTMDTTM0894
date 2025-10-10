"use client"    
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareProductIds, setCompareProductIds] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('compareProductIds');
    if (saved) {
      try {
        const productIds = JSON.parse(saved);
        setCompareProductIds(productIds);
      } catch (error) {
        console.error('Error loading compare product IDs:', error);
        localStorage.removeItem('compareProductIds');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compareProductIds', JSON.stringify(compareProductIds));
  }, [compareProductIds]);

  const addToCompare = (product) => {
    if (compareProductIds.includes(product.id_products)) {
      toast.info('Sản phẩm đã có trong danh sách so sánh');
      return false;
    }

    if (compareProductIds.length >= 2) {
      toast.warning('Chỉ có thể so sánh tối đa 2 sản phẩm cùng lúc');
      return false;
    }

    setCompareProductIds(prev => [...prev, product.id_products]);
    toast.success('Đã thêm sản phẩm vào danh sách so sánh');
    // nếu đã đủ 2 id thì chuyển sang trang so sánh
    if (compareProductIds.length === 1) {
      setTimeout(() => {
        window.location.href = '/compare';
      }, 1000);
    }
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareProductIds(prev => prev.filter(id => id !== productId));
    toast.success('Đã xóa sản phẩm khỏi danh sách so sánh');
  };

  const clearCompare = () => {
    setCompareProductIds([]);
    toast.success('Đã xóa tất cả sản phẩm khỏi danh sách so sánh');
  };

  const isInCompare = (productId) => {
    return compareProductIds.includes(productId);
  };

  const getCompareCount = () => {
    return compareProductIds.length;
  };

  const canAddMore = () => {
    return compareProductIds.length < 2;
  };

  const value = {
    compareProductIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    getCompareCount,
    canAddMore
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};
