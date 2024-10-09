"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface Client {
  id: number;
  name: string;
  email: string;
  seller: Seller | null;
}

interface Seller {
  id: number;
  name: string;
}

export default function ClientSellerManagement() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Função para buscar vendedores e clientes ao carregar a página
  useEffect(() => {
    const fetchSellersAndClients = async () => {
      setLoading(true);  // Ativa o indicador de carregamento

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        // Busca lista de vendedores
        const sellersRes = await fetch("/api/sellers/list", {
          headers: {
            Authorization: `Bearer ${token}`,  // Inclui o token de autenticação
          },
        });
        if (!sellersRes.ok) throw new Error("Erro ao buscar vendedores.");
        const sellersData = await sellersRes.json();
        setSellers(Array.isArray(sellersData) ? sellersData : []);

        // Busca lista de clientes com vendedores
        const clientsRes = await fetch("/api/clients-with-sellers", {
          headers: {
            Authorization: `Bearer ${token}`,  // Inclui o token de autenticação
          },
        });
        if (!clientsRes.ok) throw new Error("Erro ao buscar clientes.");
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao buscar vendedores ou clientes:", error);
        setError("Erro ao buscar dados. Verifique sua conexão ou tente novamente.");
      } finally {
        setLoading(false);  // Desativa o indicador de carregamento
      }
    };

    fetchSellersAndClients();
  }, []);

  // Função para associar cliente ao vendedor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      // Envia a requisição para associar o cliente ao vendedor
      const res = await fetch(`/api/sellers/${selectedSeller}/add-client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // Inclui o token de autenticação
        },
        body: JSON.stringify({ clientId: selectedClient }),
      });

      if (res.ok) {
        // Recarrega a lista de clientes com vendedores
        const clientsRes = await fetch("/api/clients-with-sellers", {
          headers: {
            Authorization: `Bearer ${token}`,  // Inclui o token de autenticação
          },
        });
        const clientsData: Client[] = await clientsRes.json();
        setClients(clientsData);  // Atualiza a lista
      } else {
        alert("Erro ao associar cliente ao vendedor");
      }
    } catch (error) {
      console.error("Erro ao associar cliente:", error);
      alert("Erro ao associar cliente ao vendedor.");
    }
  };

  return (
    <div className="container">
      <h1 className="mt-4">Gerenciamento de Clientes e Vendedores</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          <form className="mb-4" onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Escolha um Vendedor</label>
                <select
                  className="form-select"
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um vendedor
                  </option>
                  {sellers.length > 0 ? (
                    sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Nenhum vendedor disponível</option>
                  )}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Escolha um Cliente</label>
                <select
                  className="form-select"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um cliente
                  </option>
                  {clients.length > 0 ? (
                    clients
                      .filter((client) => !client.seller)
                      .map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </option>
                      ))
                  ) : (
                    <option disabled>Nenhum cliente disponível</option>
                  )}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Associar Cliente
            </button>
          </form>

          <div className="row">
            <div className="col">
              <h2>Vendedores e Clientes Associados</h2>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>Clientes</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(sellers) && sellers.length > 0 ? (
                    sellers.map((seller) => {
                      const associatedClients = clients.filter(
                        (client) => client.seller?.id === seller.id
                      );
                      return (
                        <tr key={seller.id}>
                          <td>{seller.name}</td>
                          <td>
                            {associatedClients.length > 0 ? (
                              <ul>
                                {associatedClients.map((client) => (
                                  <li key={client.id}>
                                    {client.name} - {client.email}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>Sem clientes</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={2}>Nenhum vendedor disponível</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
