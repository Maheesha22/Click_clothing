import { useState, useEffect } from 'react';
import { IcoSearch, Avatar, Badge, MiniStats, IcoUsers, IcoCart, IcoCard } from './shared';
import API from '../../../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/admin-customers/dashboard-data');
      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch customer data.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load customer data.';
      setError(msg);
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userId.toString().includes(searchQuery)
  );

  // Calculate mini stats
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.number_of_orders || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.total_spending || 0), 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  if (loading) return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Customers</h1><p className="ph-sub">Fetching your customer base...</p></div></div>
      <div className="admin-card" style={{padding: '40px', textAlign: 'center'}}>
        <div className="loader-box">Loading customers...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Customers</h1><p className="ph-sub">Something went wrong.</p></div></div>
      <div className="admin-card" style={{padding: '40px', textAlign: 'center', color: 'var(--red)'}}>
        {error}
      </div>
    </div>
  );

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Customer Dashboard</h1>
          <p className="ph-sub">Manage and analyze your customer base and their purchasing behavior.</p>
        </div>
      </div>

      <MiniStats items={[
        [<IcoUsers/>, totalCustomers, 'Total Customers'],
        [<IcoCart/>, totalOrders, 'Total Orders'],
        [<IcoCard/>, `Rs ${totalRevenue.toLocaleString()}`, 'Total Revenue'],
        [<IcoCard/>, `Rs ${avgOrderValue.toLocaleString()}`, 'Avg. Order Value'],
      ]} />

      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13}/>
          <input 
            className="tb-inp" 
            placeholder="Search by name, email or ID…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tb-count">{filteredCustomers.length} Customers Found</div>
      </div>

      <div className="admin-card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1000}}>
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Email Address</th>
                <th>Full Shipping Address</th>
                <th style={{textAlign: 'center'}}>Orders</th>
                <th style={{textAlign: 'right'}}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <tr key={c.userId}>
                    <td>
                      <div className="av-cell">
                        <Avatar ini={c.first_name?.[0] + (c.last_name?.[0] || '')} />
                        <div>
                          <div className="cell-nm">{c.first_name} {c.last_name}</div>
                          <div className="cell-sub">ID: USR-{c.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cell-dim">{c.email}</td>
                    <td className="cell-dim" style={{ whiteSpace: 'normal', minWidth: '350px', lineHeight: '1.5', padding: '15px 14px' }}>
                      {c.address ? (
                        <>
                          <div style={{ color: 'var(--black)', fontWeight: '500', marginBottom: '4px' }}>{c.address}</div>
                          <div style={{ fontSize: '11px', color: 'var(--g5)' }}>
                            {[c.city, c.district, c.province].filter(Boolean).join(', ')}
                          </div>
                          {c.phone && (
                            <div style={{ fontSize: '11px', color: 'var(--g6)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📞</span> {c.phone}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--g4)', fontStyle: 'italic' }}>No address provided</span>
                      )}
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <Badge 
                        label={c.number_of_orders} 
                        cls={c.number_of_orders > 10 ? 'b-delivered' : c.number_of_orders > 0 ? 'b-active' : 'b-pending'} 
                      />
                    </td>
                    <td className="cell-price" style={{textAlign: 'right'}}>
                      Rs {parseFloat(c.total_spending).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">No customers found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
