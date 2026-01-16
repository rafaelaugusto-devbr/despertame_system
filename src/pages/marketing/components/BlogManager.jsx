// src/components/BlogManager.js

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Importe o ReactQuill e seu CSS
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import Button from '../../../components/ui/Button'; // Reutilizando seu componente de botão
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiXCircle, FiImage } from 'react-icons/fi';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    // Estado do formulário, agora com o campo 'videoUrl'
    const [currentPost, setCurrentPost] = useState({
        id: null,
        titulo: '',
        resumo: '',
        imagemUrl: '',
        videoUrl: '', // <-- NOVO CAMPO
        conteudo: ''
    });

    // Coleção 'posts' no Firestore
    const postsCollectionRef = collection(db, 'posts');

    // Módulos do Editor de Texto
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image', 'video'], // Permite adicionar links, imagens e vídeos (via URL)
            ['clean']
        ],
    };

    // Buscar posts ao carregar o componente
    useEffect(() => {
        const getPosts = async () => {
            setLoading(true);
            const q = query(postsCollectionRef, orderBy('data', 'desc'));
            const data = await getDocs(q);
            setPosts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false);
        };
        getPosts();
    }, []);

    const resetForm = () => {
        // Reseta o formulário, incluindo o novo campo de vídeo
        setCurrentPost({ id: null, titulo: '', resumo: '', imagemUrl: '', videoUrl: '', conteudo: '' });
        setIsFormVisible(false);
    };

    const handleEdit = (post) => {
        // Garante que todos os campos sejam preenchidos ao editar, mesmo os novos
        setCurrentPost({
            id: post.id,
            titulo: post.titulo || '',
            resumo: post.resumo || '',
            imagemUrl: post.imagemUrl || '',
            videoUrl: post.videoUrl || '',
            conteudo: post.conteudo || '',
            data: post.data // Preserva a data original
        });
        setIsFormVisible(true);
        window.scrollTo(0, 0); // Rola para o topo para ver o formulário
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
            const postDoc = doc(db, 'posts', id);
            await deleteDoc(postDoc);
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Monta o objeto de dados para salvar, incluindo o campo de vídeo
        const postData = {
            titulo: currentPost.titulo,
            resumo: currentPost.resumo,
            imagemUrl: currentPost.imagemUrl,
            videoUrl: currentPost.videoUrl, // <-- NOVO CAMPO
            conteudo: currentPost.conteudo,
            data: currentPost.id ? currentPost.data : serverTimestamp() // Mantém a data original na edição
        };

        if (currentPost.id) {
            // Atualizar post existente
            const postDoc = doc(db, 'posts', currentPost.id);
            await updateDoc(postDoc, postData);
        } else {
            // Criar novo post
            await addDoc(postsCollectionRef, postData);
        }
        
        // Recarrega a lista de posts para exibir a nova postagem
        const data = await getDocs(query(postsCollectionRef, orderBy('data', 'desc')));
        setPosts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        
        setLoading(false);
        resetForm();
    };

    const thumbnailStyle = {
        width: '80px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px',
        backgroundColor: 'var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
    };

    return (
        <div className="link-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)'}}>
                <h2 className="link-title">Postagens do Blog</h2>
                {!isFormVisible && (
                    <Button className="btn-primary" onClick={() => setIsFormVisible(true)}>
                        <FiPlus /> Novo Post
                    </Button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="fluxo-caixa-form" style={{border: '1px solid var(--color-border)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)'}}>
                    <h3>{currentPost.id ? 'Editando Post' : 'Criar Novo Post'}</h3>
                    
                    <input
                        className="input-field"
                        placeholder="Título do Post"
                        value={currentPost.titulo}
                        onChange={(e) => setCurrentPost({...currentPost, titulo: e.target.value})}
                        required
                    />
                    <textarea
                        className="input-field"
                        placeholder="Resumo do Post (até 200 caracteres)"
                        maxLength="200"
                        value={currentPost.resumo}
                        onChange={(e) => setCurrentPost({...currentPost, resumo: e.target.value})}
                        required
                        style={{height: '100px', resize: 'vertical'}}
                    />
                    
                    <hr style={{margin: 'var(--spacing-md) 0', border: 'none', borderTop: '1px solid var(--color-border)'}}/>
                    <p style={{textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '-0.5rem', marginBottom: '1rem'}}>Mídia de Destaque (Preencha apenas UM)</p>

                    <input
                        type="url"
                        className="input-field"
                        placeholder="URL da Imagem de Capa (ex: https://... )"
                        value={currentPost.imagemUrl}
                        onChange={(e) => setCurrentPost({...currentPost, imagemUrl: e.target.value})}
                    />
                    
                    <input
                        type="url"
                        className="input-field"
                        placeholder="URL de Incorporação do Vídeo (ex: https://www.youtube.com/embed/... )"
                        value={currentPost.videoUrl}
                        onChange={(e) => setCurrentPost({...currentPost, videoUrl: e.target.value})}
                    />
                    <p style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '-0.5rem'}}>
                        <strong>Dica:</strong> No YouTube, clique em "Compartilhar" → "Incorporar" e copie apenas o link que está dentro do `src="..."`.
                    </p>
                    
                    <hr style={{margin: 'var(--spacing-md) 0', border: 'none', borderTop: '1px solid var(--color-border)'}}/>

                    <div style={{background: 'white'}}>
                        <ReactQuill
                            theme="snow"
                            value={currentPost.conteudo}
                            onChange={(value) => setCurrentPost({...currentPost, conteudo: value})}
                            modules={quillModules}
                            placeholder="Escreva o conteúdo completo do post aqui..."
                        />
                    </div>

                    <div style={{display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)'}}>
                        <Button type="submit" className="btn-primary" loading={loading} loadingText="Salvando...">
                            <FiSave /> {currentPost.id ? 'Salvar Alterações' : 'Publicar Post'}
                        </Button>
                        <Button type="button" className="btn-danger" onClick={resetForm} disabled={loading}>
                            <FiXCircle /> Cancelar
                        </Button>
                    </div>
                </form>
            )}

            <hr style={{margin: 'var(--spacing-lg) 0', border: 'none', borderTop: '1px solid var(--color-border)'}}/>

            <div className="user-table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Imagem</th>
                            <th>Título</th>
                            <th>Data</th>
                            <th style={{textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{textAlign: 'center'}}>Carregando posts...</td></tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id}>
                                    <td>
                                        {post.imagemUrl ? (
                                            <img src={post.imagemUrl} alt="miniatura" style={thumbnailStyle} />
                                        ) : (
                                            <div style={thumbnailStyle} title="Sem imagem">
                                                <FiImage size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td>{post.titulo}</td>
                                    <td>{post.data ? new Date(post.data.seconds * 1000).toLocaleDateString('pt-BR') : '...'}</td>
                                    <td style={{textAlign: 'right'}}>
                                        <button onClick={() => handleEdit(post)} className="icon-btn edit" title="Editar"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(post.id)} className="icon-btn delete" title="Excluir"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BlogManager;
