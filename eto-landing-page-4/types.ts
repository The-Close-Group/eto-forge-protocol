import React from 'react';

export interface StockData {
  name: string;
  price: number;
  trend: 'up' | 'down';
}

export interface NavItem {
  label: string;
  href: string;
}

export interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  icon: React.ReactNode;
  title: string;
}