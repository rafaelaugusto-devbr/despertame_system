// src/pages/BlogManagerPage.jsx (Versão Corrigida)

import React from 'react';
import Header from '../../components/layout/Header';
import BlogManager from './components/BlogManager';

const BlogManagerPage = () => {
  return (
    <>
      <Header 
        title="Gerenciador do Blog" 
        subtitle="Crie, edite e exclua as postagens do seu blog." 
      />
      <BlogManager />
    </>
  );
};

export default BlogManagerPage;
