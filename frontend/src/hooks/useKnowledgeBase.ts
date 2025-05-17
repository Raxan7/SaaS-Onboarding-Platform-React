import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface SupportArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export const useKnowledgeBase = () => {
  const [articles, setArticles] = useState<SupportArticle[]>([]);
  const [categories, setCategories] = useState<{category: string, count: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);
  
  const fetchArticles = async (searchQuery = '') => {
    setLoading(true);
    try {
      const endpoint = searchQuery
        ? `/api/support/articles/?search=${encodeURIComponent(searchQuery)}`
        : '/api/support/articles/';
      
      const response = await api.get(endpoint);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching knowledge base articles:', err);
      setError('Failed to load knowledge base articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/support/articles/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching article categories:', err);
    }
  };
  
  const getArticlesByCategory = (category: string) => {
    return articles.filter(article => article.category === category);
  };
  
  const getArticleBySlug = async (slug: string) => {
    setLoading(true);
    try {
      // First check if we already have this article
      const existingArticle = articles.find(article => article.slug === slug);
      if (existingArticle) {
        return existingArticle;
      }
      
      // Otherwise fetch it from API
      const response = await api.get(`/api/support/articles/?search=${encodeURIComponent(slug)}`);
      const found = response.data.find((article: SupportArticle) => article.slug === slug);
      if (found) {
        return found;
      }
      return null;
    } catch (err) {
      console.error('Error fetching article by slug:', err);
      setError('Failed to load the requested article');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    articles,
    categories,
    loading,
    error,
    fetchArticles,
    getArticlesByCategory,
    getArticleBySlug
  };
};
