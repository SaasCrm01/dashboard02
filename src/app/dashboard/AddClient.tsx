// src/app/dashboard/AddClient.tsx
'use client';

import { useEffect, useState } from 'react';

interface Seller {
  id: number;
  name: string;
}

export default function AddClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Verifica se o usuário é admin para permitir escolher vendedores
    const fetchUserRole = async () => {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await res.json();
      setIsAdmin(userData.role === 'ADMIN');
    };

    // Carrega a lista de vendedores se for admin
    const fetchSellers = async () => {
      if (isAdmin) {
        const res = await fetch('/api/sellers/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sellerList = await res.json();
        setSellers(sellerList);
      }
    };

    fetchUserRole();
    fetchSellers();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('/api/clients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone, sellerId: isAdmin ? sellerId : null }),
    });

    if (res.ok) {
      alert('Cliente cadastrado com sucesso!');
      setName('');
      setEmail('');
      setPhone('');
      setSellerId(null);
    } else {
      alert('Erro ao cadastrar cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Dropdown para selecionar vendedores (disponível apenas para admins) */}
      {isAdmin && (
        <select value={sellerId || ''} onChange={(e) => setSellerId(e.target.value)} required>
          <option value="">Selecione um vendedor</option>
          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name}
            </option>
          ))}
        </select>
      )}

      <button type="submit">Cadastrar Cliente</button>
    </form>
  );
}
