'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export default function ClientsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const router = useRouter();

  // Buscar a lista de clientes da API
  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/clients/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setClients(data);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Função para submeter novo cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('/api/clients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone }),
    });

    if (res.ok) {
      alert('Cliente cadastrado com sucesso!');
      setName('');
      setEmail('');
      setPhone('');
      const newClient = await res.json();
      setClients((prevClients) => [...prevClients, newClient]);
    } else {
      alert('Erro ao cadastrar cliente');
    }
  };

  // Função para atualizar cliente
  const handleUpdateClient = async (clientId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clients/update/${clientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone }),
    });

    if (res.ok) {
      alert('Cliente atualizado com sucesso!');
      const updatedClient = await res.json();
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === clientId ? updatedClient : client
        )
      );
      setEditMode(false);
      setEditClientId(null);
      setName('');
      setEmail('');
      setPhone('');
    } else {
      alert('Erro ao atualizar cliente');
    }
  };

  // Função para excluir cliente
  const handleDeleteClient = async (clientId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clients/delete/${clientId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert('Cliente excluído com sucesso!');
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientId)
      );
    } else {
      alert('Erro ao excluir cliente');
    }
  };

  // Função para entrar em modo de edição
  const handleEdit = (client: Client) => {
    setEditMode(true);
    setEditClientId(client.id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || '');
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gerenciamento de Clientes</h1>

      {/* Formulário de Cadastro/Edição */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>{editMode ? 'Editar Cliente' : 'Cadastrar Cliente'}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={editMode ? (e) => { e.preventDefault(); handleUpdateClient(editClientId!); } : handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nome</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Telefone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista de Clientes */}
      <h2 className="mb-3">Clientes Cadastrados</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => handleEdit(client)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Nenhum cliente cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
