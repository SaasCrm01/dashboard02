"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface Client {
  id: number;
  name: string;
  email: string;
  seller: Seller | null; // Pode ser null se o cliente não tiver vendedor
}

interface Seller {
  id: number;
  name: string;
}

export default function ClientSellerManagement() {
  const [sellers, setSellers] = useState<Seller[]>([]); // Lista de vendedores
  const [clients, setClients] = useState<Client[]>([]); // Lista de clientes com vendedores
  const [selectedSeller, setSelectedSeller] = useState(""); // Vendedor selecionado
  const [selectedClient, setSelectedClient] = useState(""); // Cliente selecionado
  const router = useRouter();

  // Carrega vendedores e a lista de clientes com seus vendedores ao carregar a página
  useEffect(() => {
    const fetchSellersAndClients = async () => {
      try {
        const sellersRes = await fetch("/api/sellers/list");
        const sellersData: Seller[] = await sellersRes.json();
        setSellers(sellersData);

        const clientsRes = await fetch("/api/clients-with-sellers");
        const clientsData: Client[] = await clientsRes.json();
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao buscar vendedores ou clientes:", error);
      }
    };

    fetchSellersAndClients();
  }, []);

  // Função para associar um cliente a um vendedor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/sellers/${selectedSeller}/add-client`, {
        method: "POST",
        body: JSON.stringify({ clientId: selectedClient }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Após associar, recarrega a lista de clientes com vendedores
        const clientsRes = await fetch("/api/clients-with-sellers");
        const clientsData: Client[] = await clientsRes.json();
        setClients(clientsData); // Atualiza a lista
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
              {sellers.map((seller) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
