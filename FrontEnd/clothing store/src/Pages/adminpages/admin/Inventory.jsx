import { INVENTORY, CAT_CLS, Badge, StockBar, MiniStats } from './shared';

export default function Inventory({ toast }) {
  const stCls = { 'In Stock':'b-in', 'Low Stock':'b-low', 'Out of Stock':'b-out' };
  return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Inventory</h1><p className="ph-sub">Monitor and manage stock levels.</p></div></div>
      <MiniStats items={[['📦','1,284','Total SKUs'],['✅','1,109','In Stock'],['⚠️','131','Low Stock'],['🚫','44','Out of Stock']]}/>
      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:880}}>
            <thead><tr><th>Product Name</th><th>SKU</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {INVENTORY.map(item=>(
                <tr key={item.sku}>
                  <td className="cell-nm">{item.name}</td>
                  <td className="cell-dim">{item.sku}</td>
                  <td><span className={`cat-pill ${CAT_CLS[item.cat]||''}`}>{item.cat}</span></td>
                  <td><StockBar stock={item.stock}/></td>
                  <td className="cell-dim">{item.reorder}</td>
                  <td><Badge label={item.st} cls={stCls[item.st]}/></td>
                  <td><div className="act-grp">
                    <button className="ab ab-restock" onClick={()=>toast('📦',`Restocking ${item.name}…`)}>+ Restock</button>
                    <button className="ab ab-edit">✏️ Edit</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
